import React from 'react';
import SimliAvatar from './SimliAvatar';

export const AvatarView = ({ isSpeaking }) => {
  // Default Simli face ID - you can make this configurable later
  const defaultSimliFaceId = "0c2b8b04-5274-41f1-a21c-d5c98322efa9";
  
  return (
    <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-blue-50 to-purple-100">
      <SimliAvatar 
        simli_faceid={defaultSimliFaceId}
        showDottedFace={false}
      />
    </div>
  );
};
