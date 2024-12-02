import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Church } from "lucide-react";

interface Message {
  text: string;
  isBot: boolean;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Welcome to The Apostolic Church - Gh, Nii Boiman Central! How can I assist you today?",
      isBot: true,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    setMessages((prev) => [...prev, { text: message, isBot: false }]);
    setIsLoading(true);

    // TODO: Integrate with backend
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: "This is a placeholder response. Backend integration is pending.",
          isBot: true,
        },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-church-background">
      {/* Header */}
      <header className="bg-church-primary text-white p-4">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link to="/" className="flex-shrink-0">
              <Button variant="ghost" className="text-white hover:text-church-secondary p-0 sm:p-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Church className="h-6 w-6 text-church-secondary hidden sm:block" />
              <div>
                <h1 className="text-xl font-bold leading-tight">The Apostolic Church - Gh, Nii Boiman Central</h1>
                <p className="text-sm text-church-secondary">Chat with Aposor Kofi</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message.text}
            isBot={message.isBot}
          />
        ))}
        {isLoading && <ChatMessage message="" isBot={true} isLoading={true} />}
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default Chat;