import React, { useState } from 'react';
import { Settings, Volume2, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatSettingsProps {
  onSettingsChange?: (settings: ChatSettings) => void;
}

interface ChatSettings {
  maxSessionDuration: number; // minutes
  autoStopOnQuota: boolean;
  responseLength: 'short' | 'medium' | 'long';
  voiceSpeed: number;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({ onSettingsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    maxSessionDuration: 5, // 5 minutes default
    autoStopOnQuota: true,
    responseLength: 'short',
    voiceSpeed: 1.0
  });

  const updateSettings = (newSettings: Partial<ChatSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    onSettingsChange?.(updated);
  };

  return (
    <>
      {/* Settings Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 bg-white p-3 rounded-full border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50"
      >
        <Settings size={20} strokeWidth={3} />
      </motion.button>

      {/* Settings Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed top-16 right-4 bg-white p-6 rounded-xl border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 w-80"
        >
          <h3 className="font-black text-lg mb-4 flex items-center gap-2">
            <Settings size={20} strokeWidth={3} />
            Chat Settings
          </h3>

          <div className="space-y-4">
            {/* Session Duration */}
            <div>
              <label className="block font-bold text-sm mb-2 flex items-center gap-2">
                <Clock size={16} strokeWidth={3} />
                Max Session Duration
              </label>
              <select
                value={settings.maxSessionDuration}
                onChange={(e) => updateSettings({ maxSessionDuration: parseInt(e.target.value) })}
                className="w-full p-2 border-[2px] border-black rounded-lg font-bold"
              >
                <option value={2}>2 minutes</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>

            {/* Response Length */}
            <div>
              <label className="block font-bold text-sm mb-2 flex items-center gap-2">
                <Volume2 size={16} strokeWidth={3} />
                Response Length
              </label>
              <select
                value={settings.responseLength}
                onChange={(e) => updateSettings({ responseLength: e.target.value as 'short' | 'medium' | 'long' })}
                className="w-full p-2 border-[2px] border-black rounded-lg font-bold"
              >
                <option value="short">Short (saves quota)</option>
                <option value="medium">Medium</option>
                <option value="long">Long (uses more quota)</option>
              </select>
            </div>

            {/* Voice Speed */}
            <div>
              <label className="block font-bold text-sm mb-2 flex items-center gap-2">
                <Zap size={16} strokeWidth={3} />
                Voice Speed: {settings.voiceSpeed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.voiceSpeed}
                onChange={(e) => updateSettings({ voiceSpeed: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Auto Stop */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoStop"
                checked={settings.autoStopOnQuota}
                onChange={(e) => updateSettings({ autoStopOnQuota: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="autoStop" className="font-bold text-sm">
                Auto-stop when approaching quota limit
              </label>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="mt-4 p-3 bg-blue-50 border-[2px] border-blue-300 rounded-lg">
            <h4 className="font-bold text-sm text-blue-800 mb-2">💡 Quota Tips:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Shorter sessions use less quota</li>
              <li>• Brief responses save characters</li>
              <li>• Free tier: 10,000 chars/month</li>
              <li>• Check usage at elevenlabs.io</li>
            </ul>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full bg-black text-white py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
          >
            Apply Settings
          </button>
        </motion.div>
      )}
    </>
  );
};

export default ChatSettings;