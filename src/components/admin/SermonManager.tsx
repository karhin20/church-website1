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
  Mic, StopCircle, Eye, EyeOff, Clock, CheckCircle2, PlusCircle
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
  // New Sermon Form state
  const [newTitle, setNewTitle] = useState('');
  const [newPreacher, setNewPreacher] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAudioFile, setNewAudioFile] = useState<File | null>(null);
  const [newCloudinaryUrlInput, setNewCloudinaryUrlInput] = useState('');
  const [newPreacherImageUrl, setNewPreacherImageUrl] = useState('');
  const [newPreacherImageFile, setNewPreacherImageFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  // Edit Overlay Modal state
  const [editingSermon, setEditingSermon] = useState<SermonItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPreacher, setEditPreacher] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAudioFile, setEditAudioFile] = useState<File | null>(null);
  const [editCloudinaryUrlInput, setEditCloudinaryUrlInput] = useState('');
  const [editPreacherImageUrl, setEditPreacherImageUrl] = useState('');
  const [editPreacherImageFile, setEditPreacherImageFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);

  // General State
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
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to fetch sermons', description: err.message });
    }
  };

  // ─── Recording Logic ────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setRecordedPreviewUrl(URL.createObjectURL(blob));
        setRecordingState('stopped');
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
      };

      recorder.start(250);
      setRecordingState('recording');
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Microphone Access Error',
        description: 'Unable to access microphone. Please check permissions.',
      });
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const discardRecording = () => {
    if (recordedPreviewUrl) URL.revokeObjectURL(recordedPreviewUrl);
    setRecordedBlob(null);
    setRecordedPreviewUrl(null);
    setRecordingSeconds(0);
    setRecordingState('idle');
    chunksRef.current = [];
  };

  const saveRecording = async () => {
    if (!recordedBlob) return;
    if (!newTitle.trim() || !newPreacher.trim()) {
      toast({ variant: 'destructive', title: 'Fields Required', description: 'Enter Sermon Title and Preacher before saving.' });
      return;
    }

    setSavingRecording(true);
    try {
      const ext = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([recordedBlob], `recorded_sermon_${Date.now()}.${ext}`, { type: recordedBlob.type });

      const audioUrl = await uploadToCloudinary(file, 'video');

      let final_preacher_image_url = newPreacherImageUrl.trim();
      if (newPreacherImageFile) {
        try {
          final_preacher_image_url = await uploadToCloudinary(newPreacherImageFile, 'image');
        } catch (imgErr) {
          console.warn('Preacher image upload error:', imgErr);
        }
      }

      const { error } = await supabase.from('sermons').insert([{
        title: newTitle.trim(),
        preacher: newPreacher.trim(),
        date: newDate || new Date().toISOString().split('T')[0],
        description: newDescription.trim(),
        audio_url: audioUrl,
        preacher_image_url: final_preacher_image_url,
        recording_duration: recordingSeconds,
        is_hidden: false,
      }]);

      if (error) throw error;

      toast({ title: '🎙️ Recording saved to Cloudinary!', description: `"${newTitle}" is now in your sermon archive.` });
      discardRecording();
      resetNewForm();
      fetchSermons();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to save recording', description: err.message });
    } finally {
      setSavingRecording(false);
    }
  };

  // ─── Reset New Sermon Form ───────────────────────────────────────────────────
  const resetNewForm = () => {
    setNewTitle('');
    setNewPreacher('');
    setNewDate('');
    setNewDescription('');
    setNewAudioFile(null);
    setNewCloudinaryUrlInput('');
    setNewPreacherImageUrl('');
    setNewPreacherImageFile(null);
  };

  // ─── Create New Sermon Handler ───────────────────────────────────────────────
  const handleCreateSermon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAudioFile && !newCloudinaryUrlInput.trim()) {
      toast({ variant: 'destructive', title: 'Media required', description: 'Select an audio file or enter a Cloudinary URL.' });
      return;
    }

    setCreating(true);
    try {
      let audio_url = newCloudinaryUrlInput.trim();
      let final_preacher_image_url = newPreacherImageUrl.trim();

      if (newAudioFile) {
        try {
          audio_url = await uploadToCloudinary(newAudioFile, 'video');
        } catch {
          const ext = newAudioFile.name.split('.').pop();
          const fileName = `${Date.now()}.${ext}`;
          const { data: urlData } = supabase.storage.from('sermons').getPublicUrl(fileName);
          audio_url = urlData.publicUrl;
        }
      }

      if (newPreacherImageFile) {
        try {
          final_preacher_image_url = await uploadToCloudinary(newPreacherImageFile, 'image');
        } catch (imgErr: any) {
          console.warn('Preacher avatar upload warning:', imgErr);
        }
      }

      const { error } = await supabase.from('sermons').insert([{
        title: newTitle.trim(),
        preacher: newPreacher.trim(),
        date: newDate || new Date().toISOString().split('T')[0],
        description: newDescription.trim(),
        audio_url,
        preacher_image_url: final_preacher_image_url,
        is_hidden: false,
      }]);

      if (error) throw error;
      toast({ title: 'Sermon created & saved successfully!' });

      resetNewForm();
      fetchSermons();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error creating sermon', description: error.message });
    } finally {
      setCreating(false);
    }
  };

  // ─── Edit Overlay Handlers ────────────────────────────────────────────────────
  const handleOpenEditOverlay = (sermon: SermonItem) => {
    setEditingSermon(sermon);
    setEditTitle(sermon.title);
    setEditPreacher(sermon.preacher);
    setEditDate(sermon.date || '');
    setEditDescription(sermon.description || '');
    setEditCloudinaryUrlInput(sermon.audio_url || '');
    setEditPreacherImageUrl(sermon.preacher_image_url || '');
    setEditAudioFile(null);
    setEditPreacherImageFile(null);
  };

  const handleCloseEditOverlay = () => {
    setEditingSermon(null);
    setEditTitle('');
    setEditPreacher('');
    setEditDate('');
    setEditDescription('');
    setEditAudioFile(null);
    setEditCloudinaryUrlInput('');
    setEditPreacherImageUrl('');
    setEditPreacherImageFile(null);
  };

  const handleUpdateSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSermon) return;

    setUpdating(true);
    try {
      let audio_url = editCloudinaryUrlInput.trim();
      let final_preacher_image_url = editPreacherImageUrl.trim();

      if (editAudioFile) {
        try {
          audio_url = await uploadToCloudinary(editAudioFile, 'video');
        } catch {
          const ext = editAudioFile.name.split('.').pop();
          const fileName = `${Date.now()}.${ext}`;
          const { data: urlData } = supabase.storage.from('sermons').getPublicUrl(fileName);
          audio_url = urlData.publicUrl;
        }
      }

      if (editPreacherImageFile) {
        try {
          final_preacher_image_url = await uploadToCloudinary(editPreacherImageFile, 'image');
        } catch (imgErr: any) {
          console.warn('Preacher avatar upload warning:', imgErr);
        }
      }

      const { error } = await supabase.from('sermons').update({
        title: editTitle.trim(),
        preacher: editPreacher.trim(),
        date: editDate || new Date().toISOString().split('T')[0],
        description: editDescription.trim(),
        audio_url: audio_url || editingSermon.audio_url,
        preacher_image_url: final_preacher_image_url,
      }).eq('id', editingSermon.id);

      if (error) throw error;
      toast({ title: 'Sermon updated successfully!' });

      handleCloseEditOverlay();
      fetchSermons();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error updating sermon', description: error.message });
    } finally {
      setUpdating(false);
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
        title: newHidden ? 'Sermon hidden' : 'Sermon visible',
        description: `"${sermon.title}" is now ${newHidden ? 'hidden from public view' : 'visible on public page'}.`,
      });
      fetchSermons();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to update visibility', description: err.message });
    }
  };

  // ─── Delete Handler (Permanently deletes from database) ────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this sermon from the database?')) return;
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://backend-church.vercel.app');
      let success = false;

      // 1. Attempt permanent delete via backend API
      try {
        const res = await fetch(`${API_BASE_URL}/api/db/sermons/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          success = true;
        }
      } catch (backendErr) {
        console.warn('Backend delete endpoint warning, attempting direct Supabase deletion:', backendErr);
      }

      // 2. Fallback / Direct Supabase delete
      if (!success) {
        const { error } = await supabase.from('sermons').delete().eq('id', id);
        if (error) throw error;
      }

      toast({ title: 'Sermon permanently deleted from database' });
      fetchSermons();
    } catch (error: any) {
      console.error('Error deleting sermon:', error);
      toast({ variant: 'destructive', title: 'Error deleting sermon from database', description: error.message });
    }
  };

  return (
    <div className="space-y-8 font-sans">

      {/* ── SECTION 1: ADD NEW SERMON & RECORDING ── */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-red-100 pb-3">
          <PlusCircle className="w-6 h-6 text-church-primary" />
          <div>
            <h2 className="text-xl font-black text-church-primary">Add New Sermon</h2>
            <p className="text-xs text-gray-500">Record live audio or upload new sermon recordings to your archive.</p>
          </div>
        </div>

        {/* Recording Controls */}
        <div className="bg-white/80 rounded-2xl p-5 border border-red-100">
          <h3 className="text-xs font-bold text-church-primary uppercase tracking-wider mb-3">Option A: Record Live Audio via Microphone</h3>
          {recordingState === 'idle' && (
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={startRecording}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-6 h-11 rounded-xl flex items-center gap-2 shadow-lg"
              >
                <Mic className="w-5 h-5" />
                Start Recording
              </Button>
              <p className="text-xs text-gray-500">Click to begin recording. Ensure Title & Preacher fields below are filled.</p>
            </div>
          )}

          {recordingState === 'recording' && (
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="font-black text-red-700 text-lg tracking-widest">{formatDuration(recordingSeconds)}</span>
                <span className="text-xs text-red-500 font-semibold">RECORDING ACTIVE</span>
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
                    <><UploadCloud className="w-4 h-4" /> Save Recorded Sermon</>
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
            </div>
          )}
        </div>

        {/* New Sermon Form */}
        <form onSubmit={handleCreateSermon} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-xs font-bold text-church-primary uppercase tracking-wider border-b pb-2">Option B: Upload Audio File / Cloudinary Link</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Sermon Title</Label>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. The Power of Faith" required />
            </div>
            <div>
              <Label>Preacher</Label>
              <Input value={newPreacher} onChange={e => setNewPreacher(e.target.value)} placeholder="e.g. Pastor Richard Mensah" required />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required />
            </div>
          </div>

          <div>
            <Label>Description / Topic</Label>
            <Textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Brief summary of the message..." />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Audio File (Cloudinary Upload)</Label>
              <Input type="file" accept="audio/*,video/*" onChange={e => setNewAudioFile(e.target.files?.[0] || null)} />
            </div>
            <div>
              <Label>Or Cloudinary Audio URL</Label>
              <Input value={newCloudinaryUrlInput} onChange={e => setNewCloudinaryUrlInput(e.target.value)} placeholder="https://res.cloudinary.com/.../sermon.mp3" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <Label>Preacher Image (Tiny Avatar Beside Player)</Label>
              <Input type="file" accept="image/*" onChange={e => setNewPreacherImageFile(e.target.files?.[0] || null)} />
            </div>
            <div>
              <Label>Or Preacher Image URL</Label>
              <Input value={newPreacherImageUrl} onChange={e => setNewPreacherImageUrl(e.target.value)} placeholder="https://res.cloudinary.com/.../preacher.jpg" />
            </div>
          </div>

          <Button type="submit" disabled={creating} className="w-full h-11 bg-church-primary font-bold shadow-md">
            {creating ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading Sermon...</span>
            ) : 'Save & Add Sermon to Archive'}
          </Button>
        </form>
      </div>

      {/* ── SECTION 2: SERMONS ARCHIVE LIST ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4 border-b pb-3">
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
                sermon.is_hidden
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
                  className={sermon.is_hidden ? 'text-gray-400' : 'text-church-primary'}
                >
                  {sermon.is_hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </Button>

                {/* Edit (Opens Overlay Modal) */}
                <Button size="sm" variant="outline" onClick={() => handleOpenEditOverlay(sermon)} title="Edit Sermon">
                  <Pencil className="w-3.5 h-3.5 text-amber-600" />
                </Button>

                {/* Delete */}
                <Button size="sm" variant="outline" onClick={() => handleDelete(sermon.id)} title="Delete Sermon" className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── OVERLAY MODAL: EDIT SERMON ── */}
      {editingSermon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-gray-100 relative my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600 border border-amber-200">
                  <Pencil className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Edit Sermon</h2>
                  <p className="text-xs text-gray-500">Updating "{editingSermon.title}"</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={handleCloseEditOverlay} className="rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateSermon} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Sermon Title</Label>
                  <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
                </div>
                <div>
                  <Label>Preacher</Label>
                  <Input value={editPreacher} onChange={e => setEditPreacher(e.target.value)} required />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} required />
                </div>
              </div>

              <div>
                <Label>Description / Topic</Label>
                <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Replace Audio File</Label>
                  <Input type="file" accept="audio/*,video/*" onChange={e => setEditAudioFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <Label>Or Audio Cloudinary URL</Label>
                  <Input value={editCloudinaryUrlInput} onChange={e => setEditCloudinaryUrlInput(e.target.value)} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <Label>Replace Preacher Image Avatar</Label>
                  <Input type="file" accept="image/*" onChange={e => setEditPreacherImageFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <Label>Or Preacher Image URL</Label>
                  <Input value={editPreacherImageUrl} onChange={e => setEditPreacherImageUrl(e.target.value)} />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={handleCloseEditOverlay} className="flex-1 h-11 font-bold">
                  Cancel
                </Button>
                <Button type="submit" disabled={updating} className="flex-1 h-11 bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md">
                  {updating ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...</span>
                  ) : 'Update Sermon'}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}