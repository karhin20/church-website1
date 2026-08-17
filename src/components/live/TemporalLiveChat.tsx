import { useState, useEffect, useRef } from 'react';
import { supabase, LiveChatMessageItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, BookOpen, Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TemporalLiveChatProps {
  eventId: string;
  userName: string;
  readOnly?: boolean;
  onSendReaction?: (emoji: string) => void;
}

// Preset user avatar colors for nice visual variety like in the mockup
const AVATAR_COLORS = [
  'bg-teal-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-blue-500',
  'bg-emerald-500',
];

const EMOJI_PRESETS = ['😊', '🙏', '❤️', '🔥', '🙌', '👏', '😮', '😂', '👍'];

export default function TemporalLiveChat({ eventId, userName, readOnly, onSendReaction }: TemporalLiveChatProps) {
  const [messages, setMessages] = useState<LiveChatMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: 'nearest', inline: 'nearest' });
    }, 80);
  };

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
    fetchMessages();

    let pollInterval: ReturnType<typeof setInterval> | null = null;

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
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom();
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          if (!pollInterval) {
            pollInterval = setInterval(fetchMessages, 5000);
          }
        } else if (status === 'SUBSCRIBED' && pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      });

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: LiveChatMessageItem = {
      id: tempId,
      event_id: eventId,
      user_name: userName || 'Guest Listener',
      message: content,
      message_type: 'chat',
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
            message_type: 'chat',
          },
        ])
        .select();

      if (error) {
        console.error('Error inserting message:', error);
        setNewMessage(content);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else if (data && data[0]) {
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

  const insertEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    if (onSendReaction) {
      onSendReaction(emoji);
    }
  };

  // Helper to format text with highlighted @mentions
  const renderMessageContent = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} className="font-semibold text-purple-700">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Helper to get consistent avatar color for a username
  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  return (
    <div className="flex flex-col h-[380px] bg-white rounded-t-[28px] relative overflow-hidden font-sans">
      {/* Curved Drag Handle Pill & Title */}
      <div className="pt-3 pb-2 text-center flex-shrink-0 border-b border-gray-100 bg-white relative">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-2" />
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-800">
          LIVE CHAT
        </h3>
      </div>

      {/* Floating Reaction Bar overlay on right edge */}
      {onSendReaction && (
        <div className="absolute right-3 top-14 z-20 flex flex-col gap-2">
          {['❤️', '👍', '😮', '👏'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSendReaction(emoji)}
              className="w-8 h-8 rounded-full bg-white/90 shadow-md border border-gray-100 flex items-center justify-center text-sm hover:scale-110 active:scale-95 transition-transform"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            <span className="text-xs font-medium">Loading chat...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs italic text-center px-6">
            Welcome to the live chat! Share a message or amen. 🙏
          </div>
        ) : (
          messages.map((msg) => {
            const isVerse = msg.message_type === 'verse';
            const isMe = msg.user_name === userName;
            const avatarBg = getAvatarColor(msg.user_name);

            if (isVerse) {
              return (
                <div key={msg.id} className="w-full my-2">
                  <div className="relative rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                      <BookOpen className="w-4 h-4 text-amber-700" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                        Scripture Reading
                      </span>
                    </div>
                    <p className="text-xs italic text-gray-900 leading-relaxed font-serif">
                      &ldquo;{msg.message}&rdquo;
                    </p>
                    {msg.verse_ref && (
                      <p className="mt-1.5 text-[11px] font-bold text-amber-800">
                        — {msg.verse_ref}
                      </p>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                {/* User Avatar Circle */}
                <div className={`w-8 h-8 rounded-full ${avatarBg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm uppercase`}>
                  {msg.user_name.charAt(0)}
                </div>

                {/* Bubble & Name */}
                <div className={`flex flex-col max-w-[78%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-bold text-gray-500 mb-0.5 px-1">
                    @{msg.user_name.replace(/\s+/g, '')}
                  </span>
                  <div className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-purple-100/70 text-gray-900 rounded-tl-none border border-purple-200/40'
                  }`}>
                    {renderMessageContent(msg.message)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Input Form (No Gift Box, No CALL IN button) */}
      {!readOnly && (
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
          <div className="relative flex-1 flex items-center bg-gray-100 rounded-full px-3 py-1.5 border border-gray-200 focus-within:border-purple-500">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 text-xs border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1 h-7"
              disabled={sending}
            />

            {/* Emoji Popover */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="text-gray-400 hover:text-amber-500 transition-colors p-1"
                  title="Choose emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 bg-white rounded-2xl shadow-xl border border-gray-100" align="end">
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {EMOJI_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        insertEmoji(emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-lg p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            size="sm"
            disabled={sending || !newMessage.trim()}
            className="w-9 h-9 rounded-full bg-purple-600 text-white hover:bg-purple-700 p-0 flex items-center justify-center flex-shrink-0 shadow-sm"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      )}
    </div>
  );
}