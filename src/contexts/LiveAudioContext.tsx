import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LiveEventItem, supabase } from '@/lib/supabase';
import AgoraRTC, { IAgoraRTCClient, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://backend-church.vercel.app');

interface LiveAudioContextType {
  activeLiveEvent: LiveEventItem | null;
  userName: string;
  setUserName: (name: string) => void;
  isPlaying: boolean;
  isMuted: boolean;
  connecting: boolean;
  listenerCount: number;
  activeListeners: string[];
  autoplayBlocked: boolean;
  streamEndedByAdmin: boolean;
  joinStream: () => Promise<void>;
  leaveStream: () => Promise<void>;
  togglePlay: () => void;
  toggleMute: () => void;
  clearAutoplayBlocked: () => void;
}

const LiveAudioContext = createContext<LiveAudioContextType | undefined>(undefined);

export const LiveAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeLiveEvent, setActiveLiveEvent] = useState<LiveEventItem | null>(null);
  const [userName, setUserNameState] = useState(() => localStorage.getItem('tac_listener_name') || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [streamEndedByAdmin, setStreamEndedByAdmin] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [listenerCount, setListenerCount] = useState<number>(1);
  const [activeListeners, setActiveListeners] = useState<string[]>([]);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const remoteAudioTrackRef = useRef<IRemoteAudioTrack | null>(null);
  const listenerIdRef = useRef<string>(
    (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `listener-${Date.now()}-${Math.random()}`
  );

  const setUserName = (name: string) => {
    localStorage.setItem('tac_listener_name', name);
    setUserNameState(name);
  };

  // ── 1. Realtime Active Live Event Watcher ──────────────────────────────
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('live_events')
          .select('*')
          .eq('status', 'live')
          .order('started_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          setActiveLiveEvent(data[0]);
          setStreamEndedByAdmin(false);
        } else {
          setActiveLiveEvent(null);
        }
      } catch (err) {
        console.error('Error fetching live event in context:', err);
      }
    };

    fetchEvent();

    const channel = supabase
      .channel('global_live_events_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_events' },
        () => {
          fetchEvent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── 2. Listener Presence Tracking ───────────────────────────────────────
  useEffect(() => {
    if (!activeLiveEvent || !userName) return;

    const presenceChannel = supabase.channel(`live_listeners:${activeLiveEvent.id}`, {
      config: { presence: { key: listenerIdRef.current } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const namesList: string[] = [];
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.userName && !namesList.includes(p.userName)) {
              namesList.push(p.userName);
            }
          });
        });
        setActiveListeners(namesList);
        setListenerCount(Math.max(namesList.length, 1));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            userName,
            joined_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      presenceChannel.untrack();
      supabase.removeChannel(presenceChannel);
    };
  }, [activeLiveEvent?.id, userName]);

  // ── 3. Browser Autoplay Handler ─────────────────────────────────────────
  useEffect(() => {
    const handleAutoplayFailed = () => {
      console.warn("Autoplay blocked by browser policy");
      setAutoplayBlocked(true);
      setIsPlaying(false);
    };

    AgoraRTC.onAutoplayFailed = handleAutoplayFailed;
    return () => {
      AgoraRTC.onAutoplayFailed = null;
    };
  }, []);

  // ── 4. Agora Join & Leave Logic ─────────────────────────────────────────
  const joinStream = async () => {
    if (!activeLiveEvent || clientRef.current) return;
    setConnecting(true);

    try {
      const tokenRes = await fetch(`${API_BASE_URL}/api/agora/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName: activeLiveEvent.agora_channel, role: 'audience' }),
      });

      if (!tokenRes.ok) {
        throw new Error('Failed to fetch Agora token from backend');
      }

      const { appId, token } = await tokenRes.json();

      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;

      await client.setClientRole('audience');

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio' && user.audioTrack) {
          remoteAudioTrackRef.current = user.audioTrack;
          user.audioTrack.setVolume(isMuted ? 0 : 100);
          user.audioTrack.play();
          setIsPlaying(true);
          setMediaSession(activeLiveEvent.title, activeLiveEvent.speaker || 'Church Minister', 'playing');
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'audio') {
          setIsPlaying(false);
          setMediaSession(activeLiveEvent.title, activeLiveEvent.speaker || 'Church Minister', 'paused');
        }
      });

      await client.join(appId, activeLiveEvent.agora_channel, token || null, null);
    } catch (err) {
      console.error('Error joining stream:', err);
    } finally {
      setConnecting(false);
    }
  };

  const leaveStream = async () => {
    if (remoteAudioTrackRef.current) {
      remoteAudioTrackRef.current.stop();
      remoteAudioTrackRef.current = null;
    }
    if (clientRef.current) {
      try {
        await clientRef.current.leave();
      } catch (e) {
        // ignore leave error
      }
      clientRef.current = null;
    }
    setIsPlaying(false);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
  };

  const togglePlay = () => {
    if (remoteAudioTrackRef.current) {
      if (isPlaying) {
        remoteAudioTrackRef.current.stop();
        setIsPlaying(false);
        if (activeLiveEvent) {
          setMediaSession(activeLiveEvent.title, activeLiveEvent.speaker || 'Church Minister', 'paused');
        }
      } else {
        remoteAudioTrackRef.current.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
        if (activeLiveEvent) {
          setMediaSession(activeLiveEvent.title, activeLiveEvent.speaker || 'Church Minister', 'playing');
        }
      }
    } else if (activeLiveEvent && userName) {
      joinStream();
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (remoteAudioTrackRef.current) {
      remoteAudioTrackRef.current.setVolume(nextMuted ? 0 : 100);
    }
  };

  const clearAutoplayBlocked = () => {
    setAutoplayBlocked(false);
  };

  return (
    <LiveAudioContext.Provider
      value={{
        activeLiveEvent,
        userName,
        setUserName,
        isPlaying,
        isMuted,
        connecting,
        listenerCount,
        activeListeners,
        autoplayBlocked,
        streamEndedByAdmin,
        joinStream,
        leaveStream,
        togglePlay,
        toggleMute,
        clearAutoplayBlocked,
      }}
    >
      {children}
    </LiveAudioContext.Provider>
  );
};

export const useLiveAudioContext = () => {
  const context = useContext(LiveAudioContext);
  if (!context) {
    throw new Error('useLiveAudioContext must be used within a LiveAudioProvider');
  }
  return context;
};

function setMediaSession(title: string, artist: string, state: 'playing' | 'paused' | 'none') {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title,
    artist,
    album: 'TAC Live Broadcast',
    artwork: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  });
  navigator.mediaSession.playbackState = state;
}
