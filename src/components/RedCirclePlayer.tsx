import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { User } from 'lucide-react';

interface RedCirclePlayerProps {
  audioUrl: string;
  speakerImage?: string;
}

export const RedCirclePlayer = ({ audioUrl, speakerImage }: RedCirclePlayerProps) => {
  return (
    <div className="flex items-center space-x-3 p-2 bg-white rounded-xl shadow-md border border-gray-100">
      {speakerImage ? (
        <img 
          src={speakerImage} 
          alt="Preacher"
          className="w-11 h-11 rounded-full object-cover border border-church-primary/20 shadow-sm flex-shrink-0" 
        />
      ) : (
        <div className="w-11 h-11 rounded-full bg-church-primary/10 text-church-primary flex items-center justify-center flex-shrink-0 border border-church-primary/20">
          <User className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <AudioPlayer
          src={audioUrl}
          onPlay={() => console.log("Playing sermon")}
          showJumpControls={false}
          customAdditionalControls={[]}
        />
      </div>
    </div>
  );
};