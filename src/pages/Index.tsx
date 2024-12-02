import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";

interface Message {
  text: string;
  isBot: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Welcome to The Apostolic Church - Gh, Nii Boiman Central! How can I assist you today?",
      isBot: true,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    // Add user message
    setMessages((prev) => [...prev, { text: message, isBot: false }]);
    setIsLoading(true);

    // TODO: Integrate with backend
    // For now, we'll just simulate a response
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
      <header className="bg-church-primary text-white p-4 text-center">
        <h1 className="text-xl font-bold">The Apostolic Church - Gh</h1>
        <p className="text-sm text-church-secondary">Nii Boiman Central</p>
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

export default Index;