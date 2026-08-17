import { useState, useEffect, useRef } from 'react';
import { supabase, LiveChatMessageItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, BookOpen, Smile, Maximize2, Minimize2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TemporalLiveChatProps {
  eventId: string;
  userName: string;
  readOnly?: boolean;
}

const AVATAR_COLORS = [
  'bg-teal-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-blue-500',
  'bg-emerald-500',
];

const EMOJI_PRESETS = ['😊', '🙏', '❤️', '🔥', '🙌', '👏', '😮', '😂', '👍'];

export default function TemporalLiveChat({ eventId, userName, readOnly }: TemporalLiveChatProps) {
  const [messages, setMessages] = useState<LiveChatMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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

  const sendMessageContent = async (content: string) => {
    if (!content.trim() || sending) return;

    const trimmed = content.trim();
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: LiveChatMessageItem = {
      id: tempId,
      event_id: eventId,
      user_name: userName || 'Guest Listener',
      message: trimmed,
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
            message: trimmed,
            message_type: 'chat',
          },
        ])
        .select();

      if (error) {
        console.error('Error inserting message:', error);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else if (data && data[0]) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? data[0] : m)));
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg = newMessage;
    setNewMessage('');
    await sendMessageContent(msg);
  };

  // Clicking an emoji posts that emoji directly as a chat message under user's name
  const handleSendEmojiMessage = async (emoji: string) => {
    setShowEmojiPicker(false);
    await sendMessageContent(emoji);
  };

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

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const containerClasses = isExpanded
    ? "fixed inset-0 z-50 bg-white flex flex-col p-4 shadow-2xl animate-in fade-in zoom-in-95 font-sans"
    : "flex flex-col h-[400px] bg-white rounded-t-[28px] relative overflow-hidden font-sans";

  return (
    <div className={containerClasses}>
      {/* Floating Reduce Chat button when enlarged */}
      {isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="fixed top-4 right-4 z-[60] bg-purple-600 text-white rounded-full px-4 py-2 font-bold text-xs shadow-2xl hover:bg-purple-700 flex items-center gap-2 transition-all active:scale-95 border-2 border-white"
          title="Reduce Chat Area"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Reduce Chat</span>
        </button>
      )}

      {/* Drag Handle Pill & Title Header with Full-Surface Toggle */}
      <div className="pt-2 pb-2 px-4 flex items-center justify-between flex-shrink-0 border-b border-gray-100 bg-white relative">
        {isExpanded ? (
          <button
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full font-bold text-xs shadow-sm transition-colors"
            title="Reduce Chat"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Reduce</span>
          </button>
        ) : (
          <div className="w-16" />
        )}

        <div className="text-center">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-1" />
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-800">
            LIVE CHAT
          </h3>
        </div>

        {/* Full Surface Maximize / Minimize Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-1 text-xs font-bold"
          title={isExpanded ? "Reduce view" : "Open full surface chat"}
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-4 h-4 text-purple-600" />
              <span className="text-purple-600 hidden sm:inline">Reduce</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Expand</span>
            </>
          )}
        </button>
      </div>

      {/* Chat Messages Container (Scrollable) */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            <span className="text-xs font-medium">Loading chat...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs italic text-center px-6">
            Welcome to the live chat! Tap an emoji or type a message. 🙏
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
                <div className={`w-8 h-8 rounded-full ${avatarBg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm uppercase`}>
                  {msg.user_name.charAt(0)}
                </div>

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

      {/* Footer Input Form with Emojis on the Left */}
      {!readOnly && (
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
          
          {/* Quick Emoji Reaction Buttons / Picker on the LEFT SIDE */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Popover Emoji Picker */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-colors border border-amber-200"
                  title="Choose emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 bg-white rounded-2xl shadow-xl border border-gray-100" align="start">
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {EMOJI_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSendEmojiMessage(emoji)}
                      className="text-xl p-2 hover:bg-gray-100 rounded-xl transition-transform active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Quick One-Tap Emojis on the Left */}
            <button
              type="button"
              onClick={() => handleSendEmojiMessage('❤️')}
              className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-sm border border-red-100 transition-transform active:scale-95 hidden sm:flex"
              title="Send ❤️"
            >
              ❤️
            </button>
            <button
              type="button"
              onClick={() => handleSendEmojiMessage('👏')}
              className="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 flex items-center justify-center text-sm border border-amber-100 transition-transform active:scale-95 hidden sm:flex"
              title="Send 👏"
            >
              👏
            </button>
          </div>

          {/* Text Input Pill */}
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-3 py-1.5 border border-gray-200 focus-within:border-purple-500">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 text-xs border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1 h-7"
              disabled={sending}
            />
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