# Troubleshooting Guide - Simli + ElevenLabs Integration

## Common Connection Issues

### 1. Repeated Connection/Disconnection Loops

**Symptoms:**
- Console shows repeated "Simli connected" → "Simli disconnected" messages
- Avatar appears briefly then disappears
- Credits being consumed without stable video

**Solutions:**
1. **Check API Keys**: Ensure both keys are valid and have sufficient credits
   ```env
   VITE_SIMLI_API_KEY=your_valid_simli_key
   VITE_ELEVENLABS_API_KEY=your_valid_elevenlabs_key
   ```

2. **Verify Agent ID**: Make sure the ElevenLabs agent exists and is accessible
   - Check your ElevenLabs dashboard
   - Ensure the agent is not deleted or suspended

3. **Network Issues**: 
   - Check internet connection stability
   - Try refreshing the page
   - Disable VPN if using one

### 2. WebSocket Disconnection (Code 1005)

**Symptoms:**
- "ElevenLabs WebSocket disconnected 1005" in console
- Voice input not working
- AI not responding to speech

**Solutions:**
1. **Browser Permissions**: Ensure microphone access is granted
   - Click the microphone icon in browser address bar
   - Allow microphone access for the site

2. **HTTPS Requirement**: WebRTC requires HTTPS in production
   - Development on localhost is fine
   - Use HTTPS for deployed versions

3. **Firewall/Network**: Check if WebSocket connections are blocked
   - Try different network (mobile hotspot)
   - Check corporate firewall settings

### 3. Simli Connection Failures

**Symptoms:**
- "Simli error" messages in console
- Video element shows black screen
- Connection status shows red dot

**Solutions:**
1. **API Key Issues**:
   - Verify key is correct (no extra spaces)
   - Check account status on Simli dashboard
   - Ensure sufficient credits

2. **Face ID Problems**:
   - Use default face ID: `0c2b8b04-5274-41f1-a21c-d5c98322efa9`
   - If using custom face, verify it exists in your Simli account

3. **Browser Compatibility**:
   - Use Chrome, Firefox, or Safari (latest versions)
   - Enable hardware acceleration in browser settings

### 4. Audio Processing Issues

**Symptoms:**
- "ScriptProcessorNode is deprecated" warning
- Poor audio quality or delays
- Microphone not detecting speech

**Solutions:**
1. **Browser Settings**:
   - Check microphone permissions
   - Test microphone in other applications
   - Adjust microphone sensitivity

2. **Audio Quality**:
   - Use headphones to prevent echo
   - Ensure quiet environment
   - Speak clearly and at normal volume

3. **Performance**:
   - Close other browser tabs
   - Disable browser extensions
   - Use a powerful device for better performance

## Debugging Steps

### 1. Check Console Logs
Open browser developer tools (F12) and look for:
- Connection status messages
- Error messages with details
- WebSocket connection attempts

### 2. Test Components Separately
Visit `/simli-test` page to test:
- Simli-only mode (tests Simli connection)
- ElevenLabs + Simli mode (tests full integration)

### 3. Verify Environment Setup
Check that all required environment variables are set:
```bash
# In your .env file
VITE_SIMLI_API_KEY=sk_...
VITE_ELEVENLABS_API_KEY=sk_...
```

### 4. Network Diagnostics
- Test internet speed (minimum 5 Mbps recommended)
- Check WebSocket connectivity
- Verify no proxy/VPN interference

## Error Messages Reference

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Agent ID is required" | No agent ID provided | Check avatar has agent_id in database |
| "Simli API key not found" | Missing API key | Add VITE_SIMLI_API_KEY to .env |
| "ElevenLabs API key not found" | Missing API key | Add VITE_ELEVENLABS_API_KEY to .env |
| "Connection timeout" | Network/server issues | Check internet, retry connection |
| "Microphone access failed" | Permission denied | Grant microphone permissions |
| "WebSocket connection failed" | Network/firewall | Check network settings, try different connection |

## Performance Optimization

### 1. Reduce Connection Load
- Don't start multiple sessions simultaneously
- Close sessions properly when done
- Avoid rapid connect/disconnect cycles

### 2. Audio Processing
- Use modern browsers with WebRTC support
- Enable hardware acceleration
- Close unnecessary applications

### 3. Network Optimization
- Use wired internet connection when possible
- Ensure stable connection (avoid WiFi issues)
- Test during off-peak hours

## Getting Help

### 1. Collect Debug Information
Before reporting issues, gather:
- Browser console logs
- Network tab in developer tools
- System specifications
- Internet connection details

### 2. Test Environment
- Try different browsers
- Test on different devices
- Use different network connections

### 3. Service Status
Check service status:
- [Simli Status](https://status.simli.ai) (if available)
- [ElevenLabs Status](https://status.elevenlabs.io) (if available)

## Prevention Tips

1. **Stable Environment**: Use reliable internet and modern browser
2. **Proper Cleanup**: Always end sessions properly
3. **Monitor Credits**: Keep track of API usage
4. **Regular Updates**: Keep dependencies updated
5. **Test Regularly**: Use the test page to verify functionality

## Advanced Debugging

### Enable Verbose Logging
Add to your component for detailed logs:
```javascript
// In SimliElevenLabsAvatar.jsx
console.log("Connection state:", { isSimliConnected, isElevenLabsConnected, isLoading });
```

### Monitor WebRTC Stats
Use browser developer tools:
1. Go to `chrome://webrtc-internals/` (Chrome)
2. Monitor connection statistics
3. Check for packet loss or connection issues

### Network Analysis
Use browser Network tab to monitor:
- WebSocket connection attempts
- API calls to Simli/ElevenLabs
- Response times and errors

This troubleshooting guide should help resolve most common issues with the Simli + ElevenLabs integration.