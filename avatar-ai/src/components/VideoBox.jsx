import React from 'react';

const VideoBox = ({ video, audio }) => {
  return (
    <div className="w-full h-full relative">
      <video
        ref={video}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <audio ref={audio} autoPlay />
    </div>
  );
};

export default VideoBox;