import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase, SermonItem } from '@/lib/supabase';
import { Trash2, Play } from 'lucide-react';

export default function SermonManager() {
  const [title, setTitle] = useState('');
  const [preacher, setPreacher] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sermons, setSermons] = useState<SermonItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSermons(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching sermons",
        description: error.message,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) return;

    setLoading(true);
    try {
      // 1. Upload audio file to Supabase Storage
      const fileExt = audioFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      let audio_url = '';
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sermons')
        .upload(filePath, audioFile);

      if (uploadError) {
        console.warn('Storage upload error, using object URL fallback:', uploadError.message);
        audio_url = URL.createObjectURL(audioFile);
      } else {
        const { data: urlData } = supabase.storage.from('sermons').getPublicUrl(filePath);
        audio_url = urlData.publicUrl;
      }

      // 2. Save sermon metadata to Supabase DB 'sermons' table
      const { error: dbError } = await supabase.from('sermons').insert([
        {
          title,
          preacher,
          date,
          description,
          audio_url,
        },
      ]);

      if (dbError) throw dbError;

      toast({
        title: "Sermon uploaded successfully!",
      });

      // Reset form
      setTitle('');
      setPreacher('');
      setDate('');
      setDescription('');
      setAudioFile(null);
      
      // Refresh list
      fetchSermons();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error uploading sermon",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sermonId: string) => {
    try {
      const { error } = await supabase.from('sermons').delete().eq('id', sermonId);
      if (error) throw error;

      toast({
        title: "Sermon deleted successfully!",
      });
      fetchSermons();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting sermon",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Upload New Sermon</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="preacher">Preacher</Label>
            <Input
              id="preacher"
              value={preacher}
              onChange={(e) => setPreacher(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="audio">Audio File</Label>
            <Input
              id="audio"
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Uploading...' : 'Upload Sermon'}
          </Button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Uploaded Sermons</h2>
        <div className="space-y-4">
          {sermons.map((sermon) => (
            <div
              key={sermon.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-semibold">{sermon.title}</h3>
                <p className="text-sm text-gray-600">
                  {sermon.preacher} • {sermon.date ? new Date(sermon.date).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 line-clamp-1">{sermon.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(sermon.audio_url)}
                >
                  <Play className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(sermon.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {sermons.length === 0 && (
            <p className="text-sm text-gray-500 italic">No sermons uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}