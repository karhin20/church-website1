import React, { useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageSquare, Church, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const TypingIndicator = () => (
  <div className="flex space-x-2 p-3">
    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
  </div>
);

const ChatMessage = ({ content, isUser, isLoading = false }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[80%] p-3 rounded-lg ${
        isUser
          ? 'bg-church-primary text-white'
          : 'bg-muted'
      }`}
    >
      {isLoading ? <TypingIndicator /> : content}
    </div>
  </div>
);

const ChatInterface = () => {
  const { messages, sendMessage, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = inputRef.current;
    if (input && input.value.trim() && !isLoading) {
      await sendMessage(input.value);
      input.value = '';
    }
  };



  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-[#4C1D95] text-white p-4">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link to="/" className="flex-shrink-0">
            <Button variant="ghost" className="text-white hover:text-church-secondary p-0 sm:p-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span>Back to Home</span>
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Church className="h-6 w-6 text-secondary hidden sm:block" />
              <div>
                <p className="text-base text-church-secondary font-extrabold">
                  I AM APOSOR KOFI<br />Ask me church related questions
                </p>
              </div>
            </div>

          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-4" />
            <h3 className="font-semibold">Welcome to Church Chat!</h3>
            <p>Start a conversation by typing a message below.</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                content={message.content}
                isUser={message.isUser}
              />
            ))}
            {isLoading && (
              <ChatMessage
                content=""
                isUser={false}
                isLoading={true}
              />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;