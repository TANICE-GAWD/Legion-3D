# Create Simli App - Integrated Chat Features

This is an enhanced version of create-simli-app with integrated chat features from the avatar-ai project, including:

- **Multi-Avatar Management**: Create and manage multiple AI avatars with custom personalities
- **Real-time Voice Chat**: Voice-to-voice conversations with photorealistic avatar lip-sync
- **Session Recording**: Record and analyze conversation sessions
- **Neo-Pop UI Design**: Vibrant, playful interface with hard shadows and bold colors
- **Python + Next.js Backend**: FastAPI backend integrated with Next.js frontend

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ and pip
- API keys for ElevenLabs, Simli, Supabase, and Google Gemini

### 1. Clone and Setup

```bash
git clone <your-repo>
cd create-simli
```

### 2. Environment Configuration

Copy the environment template and fill in your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# ElevenLabs - Get from https://elevenlabs.io/
ELEVENLABS_API_KEY=sk_your_key_here
NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_your_key_here

# Simli - Get from https://simli.ai/
NEXT_PUBLIC_SIMLI_API_KEY=your_key_here

# Supabase - Get from https://supabase.com/
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here

# Google Gemini - Get from https://ai.google.dev/
GOOGLE_API_KEY=your_gemini_key_here

# Cloudinary (optional, for session recording)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
```

### 3. Database Setup (Supabase)

Create these tables in your Supabase database:

```sql
-- Avatars table
CREATE TABLE avatars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  system_prompt TEXT,
  agent_id TEXT UNIQUE NOT NULL,
  voice_id TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  first_message TEXT DEFAULT 'Hello, how can I help you?',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  avatar_id UUID REFERENCES avatars(id),
  video_url TEXT,
  audio_url TEXT,
  emotion_report JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for avatar images
INSERT INTO storage.buckets (id, name, public) VALUES ('avatar-images', 'avatar-images', true);
```

### 4. Start Development Environment

Use the integrated startup script:

```bash
python start-dev.py
```

This will:
- Install Python and Node.js dependencies
- Start FastAPI server on port 8000
- Start Next.js frontend on port 3000

Or start manually:

```bash
# Terminal 1 - Python Backend
pip install -r requirements.txt
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Next.js Frontend
npm install
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Python API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🎯 Features

### Avatar Management
- **Create Avatars**: Generate AI avatars with custom images and personalities
- **Voice Selection**: Choose from multiple ElevenLabs voices
- **Personality Customization**: Define how your avatar behaves and responds

### Real-time Chat
- **Voice-to-Voice**: Speak naturally with your avatars
- **Photorealistic Video**: Simli provides lip-sync and facial expressions
- **Connection Status**: Real-time connection monitoring and debugging

### Session Management
- **Recording**: Automatically record video sessions (optional)
- **History**: View all past conversations
- **Emotion Analysis**: AI-powered emotion analysis of conversations

### Neo-Pop Design System
- **Bold Colors**: Vibrant color palette (#4D96FF, #FFD93D, #FF6B6B, etc.)
- **Hard Shadows**: 3D-style drop shadows for depth
- **Playful Animations**: Bouncy micro-interactions using Framer Motion
- **Typography**: Heavy font weights for impact

## 🏗️ Architecture

### Frontend (Next.js 14)
```
app/
├── Components/
│   ├── chat/                    # Chat-specific components
│   │   ├── SimliElevenLabsAvatar.tsx
│   │   ├── SimliElevenLabsAvatarView.tsx
│   │   └── ConnectionDebugger.tsx
│   ├── VideoBox.tsx             # Video/audio wrapper
│   └── ...
├── api/                         # Next.js API routes (proxy to Python)
│   ├── avatars/
│   ├── sessions/
│   └── ...
├── chat/                        # Chat page
├── dashboard/                   # Avatar selection
├── create-avatar/               # Avatar creation flow
├── sessions/                    # Session history
└── page.tsx                     # Landing page
```

### Backend (Python FastAPI)
```
api/
└── main.py                      # FastAPI application
    ├── /api/generate-image      # Generate avatar images
    ├── /api/generate-prompt     # Generate system prompts
    ├── /api/create-agent        # Create ElevenLabs agents
    ├── /api/avatars             # Avatar CRUD operations
    └── /api/sessions            # Session management
```

### Data Flow
1. **Avatar Creation**: Image generation → Prompt generation → ElevenLabs agent creation → Database storage
2. **Chat Session**: WebSocket to ElevenLabs → Audio processing → Simli video synthesis → Optional recording
3. **Session Storage**: Video upload to Cloudinary → Emotion analysis → Database storage

## 🔧 Configuration

### ElevenLabs Setup
1. Create account at https://elevenlabs.io/
2. Get API key from dashboard
3. Create conversational AI agents or use the API to create them

### Simli Setup
1. Create account at https://simli.ai/
2. Get API key from dashboard
3. Use provided face IDs or upload custom faces

### Supabase Setup
1. Create project at https://supabase.com/
2. Set up database tables (see SQL above)
3. Create storage bucket for avatar images
4. Get URL and service key

### Google Gemini Setup
1. Get API key from https://ai.google.dev/
2. Used for generating avatar personality prompts

## 🎨 Customization

### Adding New Voices
Edit the voice selection in `create-avatar/page.tsx`:

```tsx
<option value="your_voice_id">Your Voice Name</option>
```

### Customizing Colors
Update the color palette in your components:

```tsx
const CARD_COLORS = [
  'bg-[#FFD93D]', // Yellow
  'bg-[#FF6B6B]', // Red
  'bg-[#A29BFE]', // Purple
  'bg-[#FF9F43]', // Orange
];
```

### Adding New Avatar Faces
Update the face ID in chat components or make it configurable per avatar.

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Railway/Render (Python Backend)
1. Create new service
2. Connect repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

### Environment Variables for Production
Update `PYTHON_API_URL` to point to your deployed Python backend:

```env
PYTHON_API_URL=https://your-python-backend.railway.app
```

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check ElevenLabs API key
   - Verify agent ID exists
   - Check browser console for errors

2. **Simli Video Not Loading**
   - Verify Simli API key
   - Check face ID is valid
   - Ensure camera permissions granted

3. **Python API Not Responding**
   - Check if Python server is running on port 8000
   - Verify all Python dependencies installed
   - Check API logs for errors

4. **Database Connection Issues**
   - Verify Supabase URL and key
   - Check if tables exist
   - Ensure storage bucket created

### Debug Mode
The connection debugger shows real-time status in development mode. Check the top-right corner of chat pages for connection status.

## 📝 API Documentation

When running locally, visit http://localhost:8000/docs for interactive API documentation.

### Key Endpoints

- `POST /api/generate-image` - Generate avatar image
- `POST /api/generate-prompt` - Generate personality prompt
- `POST /api/create-agent` - Create ElevenLabs agent
- `GET /api/avatars` - List all avatars
- `GET /api/sessions` - List conversation sessions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Simli**: For photorealistic avatar technology
- **ElevenLabs**: For conversational AI and voice synthesis
- **Supabase**: For database and storage
- **Google Gemini**: For AI-powered prompt generation
- **Framer Motion**: For smooth animations
- **Tailwind CSS**: For utility-first styling

---

Built with ❤️ using Next.js, Python FastAPI, and cutting-edge AI technologies.