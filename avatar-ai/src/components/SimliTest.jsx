import React from 'react';
import SimliAvatar from './SimliAvatar';

const SimliTest = () => {
  const testFaceId = "0c2b8b04-5274-41f1-a21c-d5c98322efa9";
  
  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-96 h-96 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-blue-500 text-white text-center">
          <h2 className="text-xl font-bold">Simli Avatar Test</h2>
        </div>
        <div className="w-full h-80">
          <SimliAvatar 
            simli_faceid={testFaceId}
            showDottedFace={false}
            fallbackImage="https://via.placeholder.com/400x400/cccccc/666666?text=Avatar"
          />
        </div>
      </div>
    </div>
  );
};

export default SimliTest;