// AudioWorklet processor for real-time audio processing
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.lastSendTime = 0;
    this.sendInterval = 100; // Send audio every 100ms
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    // Pass through audio (copy input to output)
    if (input.length > 0 && output.length > 0) {
      const inputChannel = input[0];
      const outputChannel = output[0];
      
      for (let i = 0; i < inputChannel.length; i++) {
        outputChannel[i] = inputChannel[i];
      }
      
      // Process audio for sending to WebSocket
      const currentTime = Date.now();
      if (currentTime - this.lastSendTime >= this.sendInterval) {
        this.lastSendTime = currentTime;
        
        // Calculate audio level for visual feedback
        let sum = 0;
        for (let i = 0; i < inputChannel.length; i++) {
          sum += inputChannel[i] * inputChannel[i];
        }
        const rms = Math.sqrt(sum / inputChannel.length);
        const level = Math.min(100, Math.floor(rms * 1000));
        
        // Detect if user is speaking
        const hasAudio = inputChannel.some(sample => Math.abs(sample) > 0.01);
        const isSpeakingNow = level > 5;
        
        // Send data to main thread
        this.port.postMessage({
          type: 'audioData',
          audioData: inputChannel,
          level: level,
          isSpeaking: isSpeakingNow,
          hasAudio: hasAudio
        });
      }
    }
    
    return true; // Keep processor alive
  }
}

registerProcessor('audio-processor', AudioProcessor);