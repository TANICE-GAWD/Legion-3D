from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import os
import requests
import io
import time
from supabase import create_client, Client
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GOOGLE_API_KEY)
gemini_model = genai.GenerativeModel('gemini-flash-latest')

BUCKET_NAME = "avatar-images"

class ImageRequest(BaseModel):
    name: str
    description: str = "portrait"

class PromptRequest(BaseModel):
    knowledge_base: str

class AgentRequest(BaseModel):
    name: str
    image_url: str = None
    system_prompt: str
    voice_id: str
    language: str = "en"
    first_message: str = "Hello, how can I help you?"
    model_id: str = "eleven_turbo_v2_5"

app = FastAPI()

@app.get("/api")
def health_check():
    return {"status": "FastAPI is running", "docs_url": "/docs"}


# ==========================================
# STEP 1: Generate Image & Upload to Supabase
# ==========================================
@app.post("/api/generate-image")
def generate_image(request: ImageRequest):
    try:
        encoded_prompt = requests.utils.quote(f"{request.name} {request.description}")
        pollination_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=512&height=512&seed={int(time.time())}&nologo=true"
        
        image_response = requests.get(pollination_url)
        image_response.raise_for_status()

        filename = f"{request.name.replace(' ', '_').lower()}_{int(time.time())}.jpg"
        
        supabase.storage.from_(BUCKET_NAME).upload(
            path=filename,
            file=image_response.content,
            file_options={"content-type": "image/jpeg"}
        )

        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)

        return {
            "message": "Image generated successfully",
            "image_url": public_url,
            "avatar_name": request.name
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# OPTIONAL: Upload user-provided image & store to Supabase
# ==========================================
@app.post("/api/upload-avatar-image")
async def upload_avatar_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        # Generate a safe filename
        timestamp = int(time.time())
        original_name = file.filename or "avatar"
        base, ext = os.path.splitext(original_name)
        if not ext:
            ext = ".jpg"
        filename = f"{base.replace(' ', '_').lower()}_{timestamp}{ext}"

        supabase.storage.from_(BUCKET_NAME).upload(
            path=filename,
            file=contents,
            file_options={"content-type": file.content_type or "image/jpeg"}
        )

        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)

        return {
            "message": "Image uploaded successfully",
            "image_url": public_url,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# STEP 2: Generate System Prompt using Gemini
# ==========================================
@app.post("/api/generate-prompt")
def generate_prompt(request: PromptRequest):
    try:
        meta_prompt = f"""
        You are an expert at creating system prompts for conversational AI agents. 
        Task: Create a concise, engaging system prompt for an AI agent based on this knowledge description:
        "{request.knowledge_base}"
        The prompt should define the agent's persona, capabilities, and behavioral constraints.
        Generated System Prompt:
        """

        response = gemini_model.generate_content(meta_prompt)
        
        return {
            "message": "System prompt generated",
            "system_prompt": response.text
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# STEP 3: Create ElevenLabs Agent & Save to DB
# ==========================================
@app.post("/api/create-agent")
def create_agent(request: AgentRequest):
    try:
        # 1. Call ElevenLabs API
        el_url = "https://api.elevenlabs.io/v1/convai/agents/create"
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        }
        
        el_payload = {
            "name": request.name,
            "conversation_config": {
                "agent": {
                    "prompt": { "prompt": request.system_prompt },
                    "first_message": request.first_message,
                    "language": request.language
                },
                "tts": {
                    "voice_id": request.voice_id,
                    "model_id": request.model_id
                }
            }
        }

        el_response = requests.post(el_url, json=el_payload, headers=headers)
        
        if el_response.status_code != 200:
            raise HTTPException(status_code=el_response.status_code, detail=f"ElevenLabs Error: {el_response.text}")

        agent_id = el_response.json().get('agent_id')

        # 2. Store in Supabase Database
        db_payload = {
            "name": request.name,
            "image_url": request.image_url,
            "system_prompt": request.system_prompt,
            "agent_id": agent_id,
            "voice_id": request.voice_id,
            "language": request.language,
            "first_message": request.first_message
        }

        db_data, _ = supabase.table('avatars').insert(db_payload).execute()

        return {
            "message": "Avatar created successfully!",
            "agent_id": agent_id,
            "db_record": db_data[1][0] if db_data[1] else None
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# GET All Avatars from Database
# ==========================================
@app.get("/api/avatars")
def get_avatars():
    """Fetch all avatars from the Supabase database."""
    try:
        response = supabase.table('avatars').select('id, name, image_url, agent_id, system_prompt').execute()
        
        avatars = response.data if response.data else []
        
        # Handle null image_url with placeholder
        placeholder_image = "https://via.placeholder.com/512x512/E0F2FE/1E293B?text=Avatar"
        
        for avatar in avatars:
            if not avatar.get('image_url'):
                avatar['image_url'] = placeholder_image
        
        return {
            "message": "Avatars fetched successfully",
            "count": len(avatars),
            "avatars": avatars
        }
    
    except Exception as e:
        print(f"Error fetching avatars: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# GET All Sessions from Database
# ==========================================
@app.get("/api/sessions")
def get_sessions():
    """Fetch all sessions with avatar info from the Supabase database."""
    try:
        # Fetch sessions with avatar details via join
        response = supabase.table('sessions').select(
            'id, created_at, avatar_id, video_url, audio_url, emotion_report, avatars(id, name, image_url)'
        ).order('created_at', desc=True).execute()
        
        sessions = response.data if response.data else []
        
        return {
            "message": "Sessions fetched successfully",
            "count": len(sessions),
            "sessions": sessions
        }
    
    except Exception as e:
        print(f"Error fetching sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# GET Single Session by ID
# ==========================================
@app.get("/api/sessions/{session_id}")
def get_session(session_id: str):
    """Fetch a single session by ID with full details."""
    try:
        response = supabase.table('sessions').select(
            'id, created_at, avatar_id, video_url, audio_url, emotion_report, avatars(id, name, image_url)'
        ).eq('id', session_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "message": "Session fetched successfully",
            "session": response.data
        }
    
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error fetching session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))