import { useState, useEffect, useRef } from 'react';
import { supabase, LiveEventItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Radio, Mic, MicOff, Square, MessageSquare, Headphones, BookOpen, UploadCloud, Loader2, Clock, CircleDot } from 'lucide-react';
import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import TemporalLiveChat from '../live/TemporalLiveChat';
import AdminBiblePanel from './AdminBiblePanel';
import { uploadToCloudinary } from '@/lib/cloudinary';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://backend-church.vercel.app');

// ─── Helper: format seconds to mm:ss ─────────────────────────────────────────
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function LiveEventManager() {
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [description, setDescription] = useState('');
  const [activeEvent, setActiveEvent] = useState<LiveEventItem | null>(null);
  const [listenerCount, setListenerCount] = useState(0);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'bible'>('chat');
  const { toast } = useToast();

  // ── Broadcast & Recording State ─────────────────────────────────────────────
  const [broadcastSeconds, setBroadcastSeconds] = useState(0);
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [savingRecording, setSavingRecording] = useState(false);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

  // MediaRecorder refs for manual broadcast recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<BlobPart[]>([]);
  const broadcastTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fetchActiveEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('live_events')
        .select('*')
        .eq('status', 'live')
        .order('started_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setActiveEvent(data[0]);
      } else {
        setActiveEvent(null);
      }
    } catch (err) {
      console.error('Error fetching active live event:', err);
    }
  };

  useEffect(() => {
    fetchActiveEvent();
    const interval = setInterval(fetchActiveEvent, 5000);
    return () => {
      clearInterval(interval);
      cleanupAgora();
      stopBroadcastTimer();
      stopRecordingTimer();
    };
  }, []);

  // ── Live listener count via Supabase Presence ────────────────────────────
  useEffect(() => {
    if (!activeEvent) {
      setListenerCount(0);
      return;
    }

    const channelName = `live_listeners:${activeEvent.id}`;

    // Remove any existing channel with the same name first (prevents
    // "cannot add callbacks after subscribe" on React strict-mode remounts)
    const existing = supabase.getChannels().find(ch => ch.topic === `realtime:${channelName}`);
    if (existing) {
      supabase.removeChannel(existing);
    }

    const presenceChannel = supabase.channel(channelName);

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setListenerCount(Object.keys(state).length);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [activeEvent?.id]);

  const stopBroadcastTimer = () => {
    if (broadcastTimerRef.current) {
      clearInterval(broadcastTimerRef.current);
      broadcastTimerRef.current = null;
    }
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const cleanupAgora = async () => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
      localAudioTrackRef.current = null;
    }
    if (clientRef.current) {
      try {
        await clientRef.current.leave();
      } catch (e) {
        // ignore leave errors on cleanup
      }
      clientRef.current = null;
    }
    setIsBroadcasting(false);
  };

  // ── Start Broadcast (No Auto-Recording) ───────────────────────────────────
  const handleStartBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const channelName = `tac_live_${Date.now()}`;

      // 1. Fetch Agora session token from Express Backend API
      const tokenRes = await fetch(`${API_BASE_URL}/api/agora/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, role: 'host' }),
      });

      if (!tokenRes.ok) {
        throw new Error('Failed to obtain streaming credentials from backend server');
      }

      const { appId, token } = await tokenRes.json();

      // 2. Get microphone stream access FIRST (for Agora and potential MediaRecorder)
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = micStream;

      // 3. Create Agora RTC Client & Join with Backend Credentials
      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;

      await client.setClientRole('host');
      await client.join(appId, channelName, token || null, null);

      // 4. Create microphone track from shared stream & publish to Agora
      const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = microphoneTrack;
      await client.publish([microphoneTrack]);

      // 5. Start broadcast duration timer
      setBroadcastSeconds(0);
      broadcastTimerRef.current = setInterval(() => {
        setBroadcastSeconds(s => s + 1);
      }, 1000);

      // Reset recording states
      setIsRecordingActive(false);
      setRecordingSeconds(0);

      // 6. Save live event session to Supabase DB
      const { data, error } = await supabase
        .from('live_events')
        .insert([
          {
            title,
            speaker: speaker || 'Pastor / Speaker',
            description,
            status: 'live',
            agora_channel: channelName,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setActiveEvent(data[0]);
      }

      setIsBroadcasting(true);
      setIsMuted(false);
      toast({
        title: "🔴 Live broadcast started!",
        description: "Audio is broadcasting live. You can start/stop manual recording at any time.",
      });
    } catch (error: any) {
      console.error('Error starting live broadcast:', error);
      toast({
        variant: "destructive",
        title: "Broadcast initialization error",
        description: error.message || "Failed to access microphone or connect via backend server.",
      });
      await cleanupAgora();
    } finally {
      setLoading(false);
    }
  };

  // ── Manual Start Recording ────────────────────────────────────────────────
  const startManualRecording = () => {
    if (!streamRef.current) {
      toast({
        variant: 'destructive',
        title: 'Microphone inactive',
        description: 'Microphone stream is not available. Please restart your live event broadcast.',
      });
      return;
    }

    try {
      recordingChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/mp4';

      const recorder = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordingChunksRef.current.push(e.data);
      };

      recorder.start(500); // Collect chunk every 500ms
      setIsRecordingActive(true);
      setRecordingSeconds(0);

      stopRecordingTimer();
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);

      toast({
        title: "🎙️ Recording started",
        description: "The live broadcast is being recorded locally.",
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to start recording',
        description: err.message,
      });
    }
  };

  // ── Manual Stop Recording & Save to Cloudinary ─────────────────────────────
  const stopManualRecording = async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive' || !activeEvent) return;

    setSavingRecording(true);
    const recordedDuration = recordingSeconds;

    try {
      // 1. Stop recorder and collect full Blob
      let recordedBlob: Blob | null = null;
      await new Promise<void>((resolve) => {
        if (!mediaRecorderRef.current) { resolve(); return; }
        mediaRecorderRef.current.onstop = () => resolve();
        mediaRecorderRef.current.stop();
      });

      const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
      recordedBlob = new Blob(recordingChunksRef.current, { type: mimeType });

      // Stop recording timer
      stopRecordingTimer();
      setIsRecordingActive(false);
      setRecordingSeconds(0);

      // 2. Upload recorded Blob to Cloudinary (via backend) + save to DB
      if (recordedBlob && recordedBlob.size > 0) {
        const ext = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
        const sermonFile = new File(
          [recordedBlob],
          `live_sermon_${Date.now()}.${ext}`,
          { type: recordedBlob.type }
        );

        const audio_url = await uploadToCloudinary(sermonFile, 'video');

        const { error: sermonErr } = await supabase.from('sermons').insert([{
          title: activeEvent.title,
          preacher: activeEvent.speaker || 'Pastor / Speaker',
          date: new Date().toISOString().split('T')[0],
          description: activeEvent.description || '',
          audio_url,
          recording_duration: recordedDuration,
          is_hidden: false,
        }]);

        if (sermonErr) throw sermonErr;

        toast({
          title: "✅ Sermon saved successfully!",
          description: `"${activeEvent.title}" has been saved to your sermon archive.`,
        });
      }
    } catch (uploadErr: any) {
      toast({
        variant: "destructive",
        title: "Recording upload failed",
        description: uploadErr.message || "Failed to save sermon recording to Cloudinary.",
      });
    } finally {
      setSavingRecording(false);
    }
  };

  // ── End Live Broadcast ────────────────────────────────────────────────────
  const handleEndBroadcast = async () => {
    if (!activeEvent) return;

    setLoading(true);

    try {
      // 1. If currently recording, stop and save it first
      if (isRecordingActive) {
        await stopManualRecording();
      }

      // Stop mic stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      stopBroadcastTimer();
      stopRecordingTimer();

      // 2. Stop Agora broadcast
      await cleanupAgora();

      // 3. Mark live event as ended in DB
      const { error } = await supabase
        .from('live_events')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', activeEvent.id);

      if (error) throw error;

      toast({
        title: "📡 Broadcast ended",
        description: "The live stream has been closed.",
      });

      setActiveEvent(null);
      setTitle('');
      setSpeaker('');
      setDescription('');
      setBroadcastSeconds(0);
      setIsRecordingActive(false);
      setRecordingSeconds(0);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error ending broadcast",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = () => {
    if (localAudioTrackRef.current) {
      const nextMuteState = !isMuted;
      localAudioTrackRef.current.setMuted(nextMuteState);
      setIsMuted(nextMuteState);
      toast({
        title: nextMuteState ? "🔇 Microphone Muted" : "🎙️ Microphone Active",
      });
    }
  };

  return (
    <div className="space-y-6">

      {/* Saving recording overlay notification */}
      {savingRecording && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-5 py-4 rounded-2xl flex items-center gap-3 shadow-sm animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <div>
            <p className="font-bold text-sm">Uploading sermon recording to Cloudinary...</p>
            <p className="text-xs opacity-80">Saving the recorded broadcast segment into the sermon archive.</p>
          </div>
          <UploadCloud className="w-5 h-5 text-emerald-600 ml-auto" />
        </div>
      )}

      {/* Active Broadcast Control */}
      {activeEvent ? (
        <div className="bg-gradient-to-r from-red-900 to-red-700 text-white p-6 rounded-lg shadow-lg border border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
              <h2 className="text-2xl font-bold tracking-wide uppercase">Broadcast In Progress</h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Live broadcast duration timer */}
              <span className="text-xs bg-black/40 px-3 py-1 rounded-full font-mono flex items-center gap-1.5 text-red-200">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(broadcastSeconds)} ON AIR
              </span>
              <span className="text-xs bg-black/40 px-3 py-1 rounded-full font-mono flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-church-secondary" />
                {listenerCount} listening
              </span>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-md mb-4 space-y-1">
            <h3 className="text-xl font-bold text-yellow-300">{activeEvent.title}</h3>
            <p className="text-sm text-gray-200">Speaker: {activeEvent.speaker || 'Admin'}</p>
            {activeEvent.description && (
              <p className="text-xs text-gray-300 italic">{activeEvent.description}</p>
            )}
          </div>

          {/* Manual Recording Panel */}
          <div className="bg-black/25 rounded-2xl p-4 mb-5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isRecordingActive ? (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-black tracking-widest text-red-300 font-mono">
                    REC {formatDuration(recordingSeconds)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-300 text-xs">
                  <CircleDot className="w-4 h-4 text-gray-400" />
                  <span>Recording is inactive. Start manual recording to archive the sermon.</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!isRecordingActive ? (
                <Button
                  type="button"
                  onClick={startManualRecording}
                  disabled={savingRecording}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-1.5"
                >
                  <Mic className="w-4 h-4" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={stopManualRecording}
                  disabled={savingRecording}
                  className="bg-white hover:bg-gray-100 text-red-700 font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-1.5 border"
                >
                  <Square className="w-4 h-4 text-red-600 fill-current animate-pulse" />
                  Stop & Save Recording
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "secondary"}
                className="font-semibold h-10 text-xs"
              >
                {isMuted ? <MicOff className="w-4 h-4 mr-1.5" /> : <Mic className="w-4 h-4 mr-1.5" />}
                {isMuted ? "Unmute Mic" : "Mute Mic"}
              </Button>
            </div>

            <Button
              type="button"
              onClick={handleEndBroadcast}
              disabled={loading}
              className="bg-red-950 hover:bg-black text-white font-bold px-5 h-10 text-xs border border-red-400"
            >
              <Square className="w-4 h-4 mr-1.5 text-red-500 fill-current" />
              {loading ? 'Ending...' : 'End Broadcast'}
            </Button>
          </div>

          {/* Admin panel tabs: Live Chat | Bible */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-white text-church-primary shadow'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Live Chat
              </button>
              <button
                onClick={() => setActiveTab('bible')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'bible'
                    ? 'bg-amber-400 text-amber-900 shadow'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Bible
              </button>
            </div>

            {activeTab === 'chat' ? (
              <div className="bg-white text-gray-900 rounded-lg p-3">
                <TemporalLiveChat eventId={activeEvent.id} userName="Admin (Host)" />
              </div>
            ) : (
              <div className="bg-white text-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-amber-800">Post a Scripture to Live Chat</h4>
                </div>
                <AdminBiblePanel eventId={activeEvent.id} userName="Admin (Host)" />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Create New Live Event Form */
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-4">
            <Radio className="w-7 h-7 text-church-primary animate-pulse" />
            <h2 className="text-2xl font-bold text-church-primary">Start Live Audio Stream</h2>
          </div>

          <form onSubmit={handleStartBroadcast} className="space-y-4">
            <div>
              <Label htmlFor="title">Event / Sermon Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sunday Morning Live Worship & Sermon"
                required
              />
            </div>

            <div>
              <Label htmlFor="speaker">Speaker / Preacher Name</Label>
              <Input
                id="speaker"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                placeholder="e.g. Apostle J. K. Atinyo"
              />
            </div>

            <div>
              <Label htmlFor="description">Event Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief details about today's live audio service..."
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-lg"
            >
              <Radio className="w-5 h-5 mr-2 animate-ping" />
              {loading ? 'Starting Broadcast via Backend...' : 'Start Live Audio Event'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
