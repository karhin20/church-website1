import { useState, useEffect, useRef } from 'react';
import { supabase, LiveChatMessageItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare, Loader2 } from 'lucide-react';

interface TemporalLiveChatProps {
  eventId: string;
  userName: string;
}

export default function TemporalLiveChat({ eventId, userName }: TemporalLiveChatProps) {
  const [messages, setMessages] = useState<LiveChatMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 80);
  };

  // Fetch existing messages
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        scrollToBottom('instant');
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch immediately on mount
    fetchMessages();

    // Subscribe to real-time new messages for this event
    const channel = supabase
      .channel(`live_chat:${eventId}`)
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
          setMessages((prev) => {
            // Deduplicate — avoid double-adding own messages
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom();
        }
      )
      .subscribe((status) => {
        // Temporary debug logging — remove once realtime is confirmed working
        console.log('[TemporalLiveChat] channel status:', status, 'eventId:', eventId);

        // If subscription failed, fall back to polling
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          const interval = setInterval(fetchMessages, 5000);
          return () => clearInterval(interval);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistic add — show the message immediately instead of waiting on
    // the realtime echo (which may be delayed, or never arrive if Realtime
    // isn't enabled for this table).
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: LiveChatMessageItem = {
      id: tempId,
      event_id: eventId,
      user_name: userName || 'Guest Listener',
      message: content,
      created_at: new Date().toISOString(),
    } as LiveChatMessageItem;

    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .insert([
          {
            event_id: eventId,
            user_name: userName || 'Guest Listener',
            message: content,
          },
        ])
        .select();

      if (error) {
        console.error('Error inserting message:', error);
        setNewMessage(content);
        // Roll back the optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else if (data && data[0]) {
        // Swap the temp message for the real row (real id) so the later
        // realtime INSERT event for this row gets deduped correctly.
        setMessages((prev) => prev.map((m) => (m.id === tempId ? data[0] : m)));
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setNewMessage(content);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[420px] bg-gray-50 border rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-church-primary text-white p-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-church-secondary" />
          <h4 className="font-semibold text-sm">Event Live Chat</h4>
          {messages.length > 0 && (
            <span className="bg-church-secondary text-church-primary text-[10px] font-bold rounded-full px-1.5 py-0.5">
              {messages.length}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-300">
          Chatting as <strong className="text-church-secondary">{userName}</strong>
        </span>
      </div>

      {/* Messages Scroll Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-church-primary" />
            <span className="text-xs">Loading chat...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs italic text-center px-4">
            Welcome to the live chat! Be the first to say amen or share a message. 🙏
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_name === userName;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-gray-500 font-medium px-1 mb-0.5">
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
      <form onSubmit={handleSendMessage} className="p-2 bg-white border-t flex gap-2 flex-shrink-0">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message or amen..."
          className="flex-1 text-sm"
          disabled={sending}
        />
        <Button
          type="submit"
          size="sm"
          disabled={sending || !newMessage.trim()}
          className="bg-church-secondary text-church-primary hover:bg-church-secondary/90 flex-shrink-0"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}