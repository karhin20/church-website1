import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getFirebaseFirestore, getFirebaseStorage } from '../../admin/auth/firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Trash2, Upload, Play } from 'lucide-react';

interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  description: string;
  audioUrl: string;
}

export default function SermonManager() {
  const [title, setTitle] = useState('');
  const [preacher, setPreacher] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const { toast } = useToast();
  const firestore = getFirebaseFirestore();
  const storage = getFirebaseStorage();

  // Fetch sermons on component mount
  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const sermonsCollection = collection(firestore, 'sermons');
      const sermonsSnapshot = await getDocs(sermonsCollection);
      const sermonsList = sermonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Sermon));
      setSermons(sermonsList);
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
      // Upload audio file to Firebase Storage
      const storageRef = ref(storage, `sermons/${Date.now()}_${audioFile.name}`);
      await uploadBytes(storageRef, audioFile);
      const audioUrl = await getDownloadURL(storageRef);

      // Save sermon metadata to Firestore
      await addDoc(collection(firestore, 'sermons'), {
        title,
        preacher,
        date,
        description,
        audioUrl,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Sermon uploaded successfully!",
      });

      // Reset form
      setTitle('');
      setPreacher('');
      setDate('');
      setDescription('');
      setAudioFile(null);
      
      // Refresh sermons list
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
      await deleteDoc(doc(firestore, 'sermons', sermonId));
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
                  {sermon.preacher} • {new Date(sermon.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(sermon.audioUrl)}
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
        </div>
      </div>
    </div>
  );
} 