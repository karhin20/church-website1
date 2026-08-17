import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase, SermonItem } from '@/lib/supabase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import {
  Trash2, Play, UploadCloud, Loader2, Pencil, X,
  Mic, MicOff, StopCircle, Eye, EyeOff, Clock, CheckCircle2, Radio
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type RecordingState = 'idle' | 'recording' | 'stopped';

// ─── Helper: format seconds to mm:ss ─────────────────────────────────────────
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function SermonManager() {
  // Form state
  const [editingSermon, setEditingSermon] = useState<SermonItem | null>(null);
  const [title, setTitle] = useState('');
  const [preacher, setPreacher] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [cloudinaryUrlInput, setCloudinaryUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sermons, setSermons] = useState<SermonItem[]>([]);
  const { toast } = useToast();

  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedPreviewUrl, setRecordedPreviewUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [savingRecording, setSavingRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchSermons();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ─── Fetch Sermons (admin — include hidden) ──────────────────────────────────
  const fetchSermons = async () => {
    try {
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setSermons(data || []);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error fetching sermons', description: error.message });
    }
  };

  // ─── Recording Controls ───────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setRecordedPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start(250);
      setRecordingState('recording');
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Microphone access denied', description: err.message });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingState('stopped');
  };

  const discardRecording = () => {
    setRecordedBlob(null);
    setRecordedPreviewUrl(null);
    setRecordingSeconds(0);
    setRecordingState('idle');
  };

  const saveRecording = async () => {
    if (!recordedBlob || !title || !preacher || !date) {
      toast({
        variant: 'destructive',
        title: 'Fill in sermon details first',
        description: 'Title, Preacher, and Date are required before saving the recording.',
      });
      return;
    }

    setSavingRecording(true);
    try {
      // Convert Blob to File for upload
      const ext = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([recordedBlob], `sermon_recording_${Date.now()}.${ext}`, { type: recordedBlob.type });

      const audio_url = await uploadToCloudinary(file, 'video');

      const { error } = await supabase.from('sermons').insert([{
        title,
        preacher,
        date,
        description,
        audio_url,
        recording_duration: recordingSeconds,
        is_hidden: false,
      }]);

      if (error) throw error;

      toast({ title: '🎙️ Recording saved to Cloudinary!', description: `"${title}" is now in your sermon archive.` });
      discardRecording();
      handleCancelEdit();
      fetchSermons();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to save recording', description: err.message });
    } finally {
      setSavingRecording(false);
    }
  };

  // ─── Form actions ─────────────────────────────────────────────────────────────
  const handleStartEdit = (sermon: SermonItem) => {
    setEditingSermon(sermon);
    setTitle(sermon.title);
    setPreacher(sermon.preacher);
    setDate(sermon.date || '');
    setDescription(sermon.description || '');
    setCloudinaryUrlInput(sermon.audio_url || '');
    setAudioFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingSermon(null);
    setTitle('');
    setPreacher('');
    setDate('');
    setDescription('');
    setAudioFile(null);
    setCloudinaryUrlInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingSermon && !audioFile && !cloudinaryUrlInput.trim()) {
      toast({ variant: 'destructive', title: 'Media required', description: 'Select a file or enter a Cloudinary URL.' });
      return;
    }

    setLoading(true);
    try {
      let audio_url = cloudinaryUrlInput.trim();

      if (audioFile) {
        try {
          audio_url = await uploadToCloudinary(audioFile, 'video');
        } catch {
          const ext = audioFile.name.split('.').pop();
          const fileName = `${Date.now()}.${ext}`;
          const { data: urlData } = supabase.storage.from('sermons').getPublicUrl(fileName);
          audio_url = urlData.publicUrl;
        }
      }

      if (editingSermon) {
        const { error } = await supabase.from('sermons').update({
          title, preacher,
          date: date || new Date().toISOString().split('T')[0],
          description,
          audio_url: audio_url || editingSermon.audio_url,
        }).eq('id', editingSermon.id);
        if (error) throw error;
        toast({ title: 'Sermon updated successfully!' });
      } else {
        const { error } = await supabase.from('sermons').insert([{
          title, preacher,
          date: date || new Date().toISOString().split('T')[0],
          description, audio_url, is_hidden: false,
        }]);
        if (error) throw error;
        toast({ title: 'Sermon saved to Cloudinary!' });
      }

      handleCancelEdit();
      fetchSermons();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error saving sermon', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  // ─── Visibility Toggle ────────────────────────────────────────────────────────
  const toggleVisibility = async (sermon: SermonItem) => {
    const newHidden = !sermon.is_hidden;
    try {
      const { error } = await supabase
        .from('sermons')
        .update({ is_hidden: newHidden })
        .eq('id', sermon.id);
      if (error) throw error;

      toast({
        title: newHidden ? '👁️ Sermon hidden from public' : '✅ Sermon now visible to all',
      });
      fetchSermons();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error updating visibility', description: error.message });
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (sermonId: string) => {
    if (!window.confirm('Permanently delete this sermon? This cannot be undone.')) return;

    try {
      const { error } = await supabase.from('sermons').delete().eq('id', sermonId);
      if (error) throw error;
      toast({ title: 'Sermon deleted.' });
      if (editingSermon?.id === sermonId) handleCancelEdit();
      fetchSermons();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error deleting sermon', description: error.message });
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 font-sans">

      {/* ── IN-BROWSER RECORDING PANEL ── */}
      <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl shadow-sm border border-red-200">
        <div className="flex items-center gap-2 mb-4 border-b border-red-100 pb-3">
          <Radio className="w-5 h-5 text-red-600" />
          <h2 className="text-xl font-black text-red-800">Record Sermon Directly</h2>
          <span className="text-xs text-red-500 font-semibold ml-auto">Uses your microphone → saves to Cloudinary</span>
        </div>

        {/* Recording Form Fields */}
        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <div>
            <Label className="text-red-700 font-bold">Sermon Title *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. The Power of Prayer" className="border-red-200 focus:ring-red-300" />
          </div>
          <div>
            <Label className="text-red-700 font-bold">Preacher *</Label>
            <Input value={preacher} onChange={e => setPreacher(e.target.value)} placeholder="e.g. Apostle J. K. Atinyo" className="border-red-200 focus:ring-red-300" />
          </div>
          <div>
            <Label className="text-red-700 font-bold">Date *</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="border-red-200 focus:ring-red-300" />
          </div>
        </div>

        <div className="mb-5">
          <Label className="text-red-700 font-bold">Topic / Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief topic or message summary..." className="border-red-200" />
        </div>

        {/* Recording Controls */}
        <div className="bg-white/70 rounded-2xl p-5 border border-red-100">
          {recordingState === 'idle' && (
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={startRecording}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-6 h-12 rounded-xl flex items-center gap-2 shadow-lg"
              >
                <Mic className="w-5 h-5" />
                Start Recording
              </Button>
              <p className="text-xs text-gray-500">Click to begin recording using your microphone. Make sure to allow microphone access.</p>
            </div>
          )}

          {recordingState === 'recording' && (
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="font-black text-red-700 text-lg tracking-widest">{formatDuration(recordingSeconds)}</span>
                <span className="text-xs text-red-500 font-semibold">RECORDING</span>
              </div>
              <Button
                type="button"
                onClick={stopRecording}
                className="bg-gray-900 hover:bg-gray-800 text-white font-black px-6 h-11 rounded-xl flex items-center gap-2"
              >
                <StopCircle className="w-5 h-5 text-red-400" />
                Stop Recording
              </Button>
            </div>
          )}

          {recordingState === 'stopped' && recordedPreviewUrl && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                Recording complete — {formatDuration(recordingSeconds)}
              </div>

              {/* Preview Player */}
              <audio controls src={recordedPreviewUrl} className="w-full rounded-xl" />

              <div className="flex gap-3 flex-wrap">
                <Button
                  type="button"
                  onClick={saveRecording}
                  disabled={savingRecording}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 h-11 rounded-xl flex items-center gap-2 shadow-md"
                >
                  {savingRecording ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading to Cloudinary...</>
                  ) : (
                    <><UploadCloud className="w-4 h-4" /> Save to Cloudinary</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={discardRecording}
                  disabled={savingRecording}
                  className="h-11 px-5 border-red-200 text-red-600 font-bold"
                >
                  <X className="w-4 h-4 mr-1" /> Discard
                </Button>
              </div>
              <p className="text-xs text-gray-500">Preview the recording before saving. Title, Preacher, and Date fields above are required to save.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── UPLOAD / EDIT FORM ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <div className="flex items-center gap-2">
            {editingSermon ? <Pencil className="w-5 h-5 text-amber-600" /> : <UploadCloud className="w-5 h-5 text-church-primary" />}
            <h2 className="text-xl font-black">{editingSermon ? 'Edit Sermon Details' : 'Upload Recorded File'}</h2>
          </div>
          {editingSermon && (
            <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit} className="text-xs gap-1">
              <X className="w-4 h-4" /> Cancel
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Sermon Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. The Power of Faith" required />
            </div>
            <div>
              <Label>Preacher</Label>
              <Input value={preacher} onChange={e => setPreacher(e.target.value)} placeholder="e.g. Pastor Richard Mensah" required />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
          </div>

          <div>
            <Label>Description / Topic</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief summary of the message..." />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>{editingSermon ? 'Replace Audio File' : 'Audio File (Cloudinary Upload)'}</Label>
              <Input type="file" accept="audio/*,video/*" onChange={e => setAudioFile(e.target.files?.[0] || null)} />
            </div>
            <div>
              <Label>Or Cloudinary Audio URL</Label>
              <Input value={cloudinaryUrlInput} onChange={e => setCloudinaryUrlInput(e.target.value)} placeholder="https://res.cloudinary.com/.../sermon.mp3" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1 h-11 bg-church-primary font-bold">
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{editingSermon ? 'Saving...' : 'Uploading...'}</span>
              ) : editingSermon ? 'Update Sermon' : 'Save & Upload Sermon'}
            </Button>
            {editingSermon && (
              <Button type="button" variant="outline" onClick={handleCancelEdit} className="h-11 px-6">Cancel</Button>
            )}
          </div>
        </form>
      </div>

      {/* ── SERMONS ARCHIVE LIST ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black">Sermon Archive ({sermons.length})</h2>
          <span className="text-xs text-gray-500 font-semibold">
            {sermons.filter(s => s.is_hidden).length} hidden from public
          </span>
        </div>

        <div className="space-y-3">
          {sermons.map((sermon) => (
            <div
              key={sermon.id}
              className={`flex items-center justify-between p-4 border rounded-xl transition-all ${
                editingSermon?.id === sermon.id
                  ? 'border-amber-400 bg-amber-50/40 shadow-sm'
                  : sermon.is_hidden
                  ? 'border-gray-200 bg-gray-50/60 opacity-75'
                  : 'border-gray-200 hover:border-church-primary/30'
              }`}
            >
              <div className="min-w-0 flex-1 mr-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{sermon.title}</h3>
                  {sermon.is_hidden && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 flex-shrink-0">
                      HIDDEN
                    </span>
                  )}
                  {sermon.recording_duration && (
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-2.5 h-2.5" /> {formatDuration(sermon.recording_duration)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  By <strong className="text-church-primary">{sermon.preacher}</strong>
                  {sermon.date ? ` • ${new Date(sermon.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                </p>
                {sermon.description && (
                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{sermon.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Play */}
                <Button size="sm" variant="outline" onClick={() => window.open(sermon.audio_url)} title="Play Audio">
                  <Play className="w-3.5 h-3.5 text-emerald-600" />
                </Button>

                {/* Hide / Show */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleVisibility(sermon)}
                  title={sermon.is_hidden ? 'Make visible to public' : 'Hide from public'}
                  className={sermon.is_hidden ? 'border-gray-300 text-gray-400' : 'border-blue-200 text-blue-600'}
                >
                  {sermon.is_hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </Button>

                {/* Edit */}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleStartEdit(sermon)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold gap-1 text-xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Button>

                {/* Delete */}
                <Button size="sm" variant="destructive" onClick={() => handleDelete(sermon.id)} title="Delete permanently">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {sermons.length === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-8">No recorded sermons yet. Use the panels above to record or upload.</p>
          )}
        </div>
      </div>
    </div>
  );
}