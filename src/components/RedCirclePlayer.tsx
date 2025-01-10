import React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

interface RedCirclePlayerProps {
  audioUrl: string;
  speakerImage: string;
}

export const RedCirclePlayer = ({ audioUrl, speakerImage }: RedCirclePlayerProps) => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md">
      <img 
        src={speakerImage} 
        className="w-16 h-16 rounded-full object-cover" 
      />
      <div className="flex-1">
        <AudioPlayer
          src={audioUrl}
          onPlay={e => console.log("Playing")}
          // Additional props can be added here
          showJumpControls={false} // Show forward and rewind buttons
          customAdditionalControls={[]} // You can add custom controls if needed
        />
      </div>
    </div>
  );
}; 