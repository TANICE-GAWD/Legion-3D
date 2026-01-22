# Simli Avatar Integration Setup

## Overview
The avatar-ai project now includes Simli photorealistic avatar integration. This replaces the 3D avatars with real-time neural video synthesis for more engaging conversations.

## Setup Instructions

### 1. Get Your Simli API Key
1. Go to [Simli.ai](https://simli.ai) and create an account
2. Navigate to your dashboard and get your API key
3. Copy the API key

### 2. Add API Key to Environment
Open your `.env` file in the `Legion-3D/avatar-ai/` directory and add:

```env
VITE_SIMLI_API_KEY=your_simli_api_key_here
```

Replace `your_simli_api_key_here` with your actual Simli API key.

### 3. Choose Your Avatar Face
The default face ID is `0c2b8b04-5274-41f1-a21c-d5c98322efa9`. You can:

- Use the default face (already configured)
- Create your own face on Simli and replace the `faceId` in `SimliAvatarView.jsx`
- Pass different face IDs as props to the component

### 4. Test the Integration
1. Start the development server: `npm run dev`
2. Navigate to the chat page with any avatar
3. Start a session - you should see the Simli avatar appear
4. The avatar will animate when the AI is speaking

## How It Works

### Components
- **SimliAvatar.jsx**: Core Simli integration component
- **SimliAvatarView.jsx**: Wrapper component that handles speaking animation
- **ChatPage.jsx**: Modified to use Simli instead of 3D avatars

### Connection Flow
1. When a chat session starts, `SimliAvatarView` initializes
2. `SimliAvatar` connects to Simli's WebRTC service
3. When ElevenLabs AI speaks (`isSpeaking=true`), synthetic audio is sent to Simli
4. Simli generates real-time lip-sync video based on the audio
5. The photorealistic avatar appears to speak naturally

### Preventing Credit Waste
The integration includes several safeguards to prevent Simli credits from being used without showing video:

- **Connection timeout**: 15-second timeout with auto-retry
- **Retry logic**: Maximum 3 connection attempts
- **Proper initialization**: Sends initial silence to establish connection
- **Error handling**: Clear error messages and manual retry options
- **Connection status**: Visual indicators show connection state

## Troubleshooting

### Avatar Not Appearing
1. Check that `VITE_SIMLI_API_KEY` is set correctly in `.env`
2. Verify your Simli account has sufficient credits
3. Check browser console for connection errors
4. Try refreshing the page and starting a new session

### Credits Being Used Without Video
- The integration now includes proper connection management
- Initial silence is sent to establish the connection properly
- Connection timeouts prevent hanging connections
- Retry logic ensures stable connections

### Connection Issues
- Check your internet connection
- Verify the face ID is valid
- Try using a different browser
- Check Simli service status

## Customization

### Using Different Faces
To use a different Simli face, modify the `faceId` prop in `ChatPage.jsx`:

```jsx
<SimliAvatarView 
  isSpeaking={isAvatarSpeaking} 
  faceId="your-custom-face-id"
/>
```

### Adjusting Audio Generation
The synthetic audio generation can be customized in `SimliAvatarView.jsx` in the `generateSpeechAudio` function to create different speaking patterns.

## Integration Notes

- **No ElevenLabs Integration**: This integration only handles the visual avatar, not the ElevenLabs conversation
- **Existing Functionality**: All existing features (emotion analysis, session recording, etc.) remain unchanged
- **Fallback**: If Simli connection fails, the original avatar image is shown
- **Performance**: WebRTC connection provides sub-300ms latency for real-time interaction

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your Simli API key and account status
3. Test with the default face ID first
4. Ensure your internet connection is stable

The integration is designed to be robust and handle connection issues gracefully while preventing unnecessary credit usage.