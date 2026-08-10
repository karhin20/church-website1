import { useState, useEffect, useRef } from 'react';
import { supabase, LiveChatMessageItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare } from 'lucide-react';

interface TemporalLiveChatProps {
  eventId: string;
  userName: string;
}

export default function TemporalLiveChat({ eventId, userName }: TemporalLiveChatProps) {
  const [messages, setMessages] = useState<LiveChatMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time additions for this event
    const channel = supabase
      .channel(`live_chat_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const newMsg = payload.new as LiveChatMessageItem;
          setMessages((prev) => [...prev, newMsg]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const { error } = await supabase.from('live_chat_messages').insert([
        {
          event_id: eventId,
          user_name: userName || 'Guest Listener',
          message: content,
        },
      ]);

      if (error) {
        console.error('Error inserting message:', error);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-96 bg-gray-50 border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-church-primary text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-church-secondary" />
          <h4 className="font-semibold text-sm">Event Live Chat</h4>
        </div>
        <span className="text-xs text-gray-300">
          Chatting as <strong className="text-church-secondary">{userName}</strong>
        </span>
      </div>

      {/* Messages Scroll Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs italic">
            Welcome to the live chat! Be the first to say amen or share a message.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_name === userName;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-gray-500 font-medium px-1">
                  {msg.user_name}
                </span>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                    isMe
                      ? 'bg-church-primary text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border rounded-tl-none'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="p-2 bg-white border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message or amen..."
          className="flex-1 text-sm"
        />
        <Button type="submit" size="sm" disabled={sending || !newMessage.trim()} className="bg-church-secondary text-church-primary hover:bg-church-secondary/90">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
