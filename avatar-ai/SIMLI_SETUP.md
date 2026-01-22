# Simli + ElevenLabs Avatar Integration

## Overview
The avatar-ai project now includes full integration between Simli photorealistic avatars and ElevenLabs conversational AI. This creates a complete AI companion experience with real-time neural video synthesis driven by actual AI conversation audio.

## Setup Instructions

### 1. Get Your API Keys

#### Simli API Key
1. Go to [Simli.ai](https://simli.ai) and create an account
2. Navigate to your dashboard and get your API key
3. Copy the API key

#### ElevenLabs API Key
1. Go to [ElevenLabs.io](https://elevenlabs.io) and create an account
2. Navigate to your profile settings and get your API key
3. Create an agent in the ElevenLabs dashboard (or use existing agent ID)

### 2. Add API Keys to Environment
Open your `.env` file in the `Legion-3D/avatar-ai/` directory and add:

```env
VITE_SIMLI_API_KEY=your_simli_api_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

Replace the placeholder values with your actual API keys.

### 3. Configure Your Avatar
The integration uses:
- **Default Simli Face ID**: `0c2b8b04-5274-41f1-a21c-d5c98322efa9`
- **ElevenLabs Agent ID**: From your avatar's `agent_id` field in the database

### 4. Test the Integration
1. **Start the development server**: `npm run dev`
2. **Test standalone**: Visit `http://localhost:3001/simli-test`
   - Switch between "Simli Only" and "ElevenLabs + Simli" modes
   - Test with your own agent ID
3. **Test in chat**: Go to any chat session - the integrated avatar will appear

## How It Works

### Architecture
```
User Microphone → ElevenLabs AI → Audio Response → Simli Avatar → Photorealistic Video
```

### Components
- **SimliElevenLabsAvatar.jsx**: Core integration handling both services
- **SimliElevenLabsAvatarView.jsx**: Wrapper with UI and status management
- **ChatPage.jsx**: Modified to use integrated avatar instead of separate components

### Connection Flow
1. **Simli Connection**: Establishes WebRTC connection to Simli service
2. **ElevenLabs Connection**: Creates WebSocket connection to ElevenLabs agent
3. **Microphone Setup**: Captures user audio via Web Audio API
4. **Audio Pipeline**: 
   - User speaks → Microphone → ElevenLabs (speech-to-text + AI processing)
   - ElevenLabs responds → Audio data → Simli (lip-sync generation)
   - Simli generates → Real-time photorealistic video with lip-sync

### Real-Time Features
- **Sub-300ms latency** for natural conversation flow
- **Automatic turn detection** and interruption handling
- **Live lip-sync** driven by actual AI speech audio
- **Microphone permission** management and audio processing

## Integration Benefits

### Compared to Separate Components
- ✅ **Real Audio Sync**: Avatar lips move to actual AI speech, not synthetic audio
- ✅ **Seamless Experience**: Single component handles entire conversation
- ✅ **Better Performance**: Direct audio pipeline without intermediate processing
- ✅ **Natural Interaction**: True voice-to-voice conversation with visual feedback

### Preventing Credit Waste
The integration includes robust safeguards:
- **Connection Management**: Proper initialization and cleanup
- **Error Handling**: Automatic retry with limits
- **Status Monitoring**: Visual indicators for both services
- **Graceful Degradation**: Fallback to static image if connections fail

## Usage Examples

### Basic Chat Integration
```jsx
<SimliElevenLabsAvatarView 
  agentId={avatar.agent_id}
  faceId="0c2b8b04-5274-41f1-a21c-d5c98322efa9"
  onSpeakingChange={setIsAvatarSpeaking}
  onConnectionChange={setIsConnected}
/>
```

### Standalone Testing
```jsx
<SimliElevenLabsAvatar
  agentId="your-agent-id"
  faceId="your-face-id"
  autoStart={true}
  onSpeakingChange={(speaking) => console.log('AI speaking:', speaking)}
/>
```

## Troubleshooting

### Avatar Not Appearing
1. Check both API keys are set correctly in `.env`
2. Verify Simli and ElevenLabs accounts have sufficient credits
3. Check browser console for connection errors
4. Ensure microphone permissions are granted

### Audio Issues
1. **No microphone input**: Check browser permissions
2. **Poor audio quality**: Verify microphone settings and background noise
3. **Delayed responses**: Check internet connection and service status

### Connection Problems
- **Simli fails**: Check API key and account credits
- **ElevenLabs fails**: Verify agent ID exists and is accessible
- **Both fail**: Check internet connection and firewall settings

### Credits Being Used Without Video
The integration prevents this through:
- Proper connection sequencing (Simli first, then ElevenLabs)
- Connection timeouts and retry limits
- Status monitoring and error handling
- Clean disconnection on component unmount

## Customization

### Using Different Faces
```jsx
<SimliElevenLabsAvatarView 
  faceId="your-custom-face-id"
  // ... other props
/>
```

### Custom Agent Configuration
Ensure your ElevenLabs agent is configured with:
- **Voice model**: Compatible with real-time streaming
- **Response format**: Audio output enabled
- **Turn detection**: Enabled for natural conversation

## Performance Notes

- **WebRTC Connection**: Provides low-latency video streaming
- **WebSocket Connection**: Handles real-time audio and conversation state
- **Audio Processing**: Uses Web Audio API for efficient microphone handling
- **Memory Management**: Proper cleanup prevents memory leaks

## Security Considerations

- **API Keys**: Stored in environment variables, not exposed in client code
- **Microphone Access**: Requested only when needed, can be revoked
- **Data Privacy**: Audio processed by ElevenLabs according to their privacy policy
- **Connection Security**: All connections use HTTPS/WSS protocols

## Support

### Common Issues
1. **"No Agent ID" error**: Ensure avatar has `agent_id` field in database
2. **Microphone not working**: Check browser permissions and HTTPS requirement
3. **Slow responses**: Verify internet speed and service status
4. **Credits depleting**: Monitor usage in both Simli and ElevenLabs dashboards

### Debug Information
The test page (`/simli-test`) provides:
- Connection status for both services
- API key validation
- Real-time speaking status
- Agent ID verification

The integration creates a seamless AI companion experience combining the best of both services while maintaining robust error handling and performance optimization.