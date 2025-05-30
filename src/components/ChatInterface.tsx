import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageSquare, Church, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TypingIndicator = () => (
  <div className="flex space-x-2 p-3">
    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
  </div>
);

const ChatMessage = ({ content, isUser, isLoading = false }) => {
  // Only use motion.div for user messages
  const MessageComponent = isUser ? motion.div : 'div';
  
  return (
    <MessageComponent
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      {...(isUser && {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
        transition: { 
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.5 
        }
      })}
    >
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser
            ? 'bg-church-primary text-white'
            : 'bg-muted'
        }`}
      >
        {isLoading ? <TypingIndicator /> : content}
      </div>
    </MessageComponent>
  );
};

const ChatInterface = () => {
  const { messages, sendMessage, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [firstMessageSent, setFirstMessageSent] = useState(false);

  useEffect(() => {
    if (!firstMessageSent) {
      inputRef.current?.focus();
    }
  }, [firstMessageSent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      await sendMessage(inputValue);
      setInputValue("");
      setFirstMessageSent(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (window.innerWidth <= 768 && firstMessageSent) {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background max-w-4xl mx-auto">
      <motion.header 
        className="bg-[#4C1D95] text-white p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link to="/" className="flex-shrink-0">
              <Button variant="ghost" className="text-white hover:text-church-secondary p-0 sm:p-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span>Back to Home</span>
              </Button>
            </Link>
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Church className="h-6 w-6 text-secondary hidden sm:block" />
              <div>
                <p className="text-sm text-church-secondary whitespace-nowrap">
                  I am APOSOR KOFI, your AI church friend.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <motion.div 
        className="flex-1 overflow-y-auto p-4 space-y-4 pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {messages.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center h-full text-center text-muted-foreground"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <MessageSquare className="h-12 w-12 mb-4" />
            <h3 className="font-semibold">Welcome to Church Chat!</h3>
            <p>Start a conversation by typing a message below.</p>
            <p className="mt-2 text-muted-foreground">"Ask, and it will be given to you; seek, and you will find; knock, and it will be opened to you." - Matthew 7:7</p>
          </motion.div>
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
      </motion.div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onClick={handleInputClick}
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