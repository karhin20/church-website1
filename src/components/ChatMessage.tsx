import { Loader2 } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  isLoading?: boolean;
}

export const ChatMessage = ({ message, isBot, isLoading }: ChatMessageProps) => {
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[100%] rounded-lg p-3 font-bold ${
          isBot ? 'bg-muted' : 'bg-primary text-primary-foreground'
        }`}
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <strong>{message}</strong>}
      </div>
    </div>
  );
}; 