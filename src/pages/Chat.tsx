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
      text: "Welcome to The Apostolic Church - Gh, Nii Boiman Central! I'm Aposor Kofi, how can I assist you today?",
      isBot: true,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    try {
      setMessages((prev) => [...prev, { text: message, isBot: false }]);
      setIsLoading(true);

      const response = await fetch('https://backend-church.vercel.app/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { text: data.response, isBot: true }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          text: "I apologize, but I encountered an error. Please try again later.",
          isBot: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = async () => {
    try {
      await fetch('https://backend-church.vercel.app/api/chat/reset', {
        method: 'POST',
      });
      setMessages([
        {
          text: "Welcome to The Apostolic Church - Gh, Nii Boiman Central! I'm Aposor Kofi, how can I assist you today?",
          isBot: true,
        },
      ]);
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-church-background">
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
                <p className="text-base text-church-secondary font-extrabold uppercase">
                  Chat with Aposor Kofi<br />Your Church Buddy
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="ml-auto text-white hover:text-church-secondary"
              onClick={handleResetChat}
            >
              New Chat
            </Button>
          </div>
        </div>
      </header>

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

      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default Chat;
