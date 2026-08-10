import { useEffect, useState } from 'react';
import { supabase, AnnouncementItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('announcements').insert([{ title }]);
      if (error) throw error;

      toast({ title: "Announcement added successfully!" });
      setTitle('');
      fetchAnnouncements();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding announcement",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;

      toast({ title: "Announcement deleted!" });
      fetchAnnouncements();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting announcement",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Add Announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Announcement Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next Sunday is Youth Sunday Service"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Adding...' : 'Add Announcement'}
          </Button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Active Announcements</h2>
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <span className="font-medium">{announcement.title}</span>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(announcement.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          ))}
          {announcements.length === 0 && (
            <p className="text-sm text-gray-500 italic">No announcements added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}