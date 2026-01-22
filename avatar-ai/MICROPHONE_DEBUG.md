# Microphone & Audio Debugging Guide

## Issue: Avatar Not Responding to Speech

If the avatar is connected but not responding to what you're saying, it's likely a microphone or audio processing issue.

## New Debug Features Added

### 1. **Visual Microphone Monitor**
- **Location**: Bottom-left corner of avatar video
- **Shows**: 
  - Mic status (Active/Inactive)
  - Real-time audio level bar
  - Speaking detection (Speaking/Silent)

### 2. **Enhanced Console Logging**
- **🎤 User transcript**: Shows what ElevenLabs heard you say
- **🤖 Agent response**: Shows AI's text response
- **Audio level logs**: Shows when audio is being sent

## Troubleshooting Steps

### Step 1: Check Microphone Permissions
1. **Browser Permission**: Click microphone icon in address bar
2. **Allow Access**: Ensure microphone access is granted
3. **Refresh Page**: Reload after granting permissions

### Step 2: Monitor Audio Levels
1. **Look at Bottom-Left**: Check the microphone monitor
2. **Speak Normally**: Audio level bar should move when you talk
3. **Green = Good**: Level should turn green when speaking
4. **"Speaking" Status**: Should show when you're talking

### Step 3: Check Console Messages
1. **Open Developer Tools**: Press F12
2. **Speak Clearly**: Say something to the avatar
3. **Look for Messages**:
   - `🎤 User transcript: [your words]` - ElevenLabs heard you
   - `🤖 Agent response: [AI response]` - AI is responding
   - `Sending audio to ElevenLabs, level: X` - Audio being sent

### Step 4: Test Microphone Settings
1. **Volume**: Speak louder or move closer to microphone
2. **Background Noise**: Ensure quiet environment
3. **Other Apps**: Test microphone in other applications
4. **Browser**: Try different browser (Chrome recommended)

## Common Issues & Solutions

### Issue: Microphone Shows "Inactive"
**Cause**: Browser doesn't have microphone access
**Solution**: 
- Click microphone icon in browser address bar
- Select "Allow" for microphone access
- Refresh the page

### Issue: Audio Level Bar Not Moving
**Cause**: Microphone not picking up sound
**Solution**:
- Check system microphone settings
- Increase microphone volume
- Try different microphone
- Speak louder/closer to mic

### Issue: Level Bar Moves But No Transcript
**Cause**: Audio not reaching ElevenLabs or processing issue
**Solution**:
- Check console for "Sending audio to ElevenLabs" messages
- Verify ElevenLabs API key is valid
- Check internet connection
- Try speaking more clearly

### Issue: Transcript Appears But No Response
**Cause**: ElevenLabs agent not configured properly
**Solution**:
- Check agent exists in ElevenLabs dashboard
- Verify agent has proper voice and settings
- Check agent's conversation configuration

## Debug Information to Collect

If issues persist, collect this information:

### Browser Console Logs
- Any error messages
- Microphone permission status
- Audio level messages
- Transcript and response logs

### Visual Indicators
- Microphone status (Active/Inactive)
- Audio level bar behavior
- Speaking detection status
- Connection debug panel status

### System Information
- Browser type and version
- Operating system
- Microphone type (built-in, USB, etc.)
- Other applications using microphone

## Advanced Debugging

### Check WebRTC Stats
1. Go to `chrome://webrtc-internals/` (Chrome)
2. Look for audio input statistics
3. Check for packet loss or connection issues

### Test Audio Processing
1. Open browser's microphone test page
2. Verify microphone works in other WebRTC applications
3. Test with different sample rates

### Network Diagnostics
1. Check internet connection stability
2. Test WebSocket connectivity
3. Verify no firewall blocking audio streams

## Expected Behavior

When working correctly, you should see:

1. **Microphone Monitor**: 
   - Status: "Active"
   - Level bar moves when speaking
   - Shows "Speaking" when talking

2. **Console Logs**:
   - "Sending audio to ElevenLabs, level: X"
   - "🎤 User transcript: [your words]"
   - "🤖 Agent response: [AI response]"

3. **Avatar Behavior**:
   - Listens when you speak
   - Responds with voice and lip-sync
   - Shows "AI Speaking" indicator

## Quick Fixes

### Most Common Solutions:
1. **Grant microphone permissions** in browser
2. **Speak louder** or move closer to microphone
3. **Check system microphone settings**
4. **Try different browser** (Chrome recommended)
5. **Refresh page** after changing permissions

The new debug features should help identify exactly where the audio pipeline is failing!