import { useEffect, useState } from 'react';
import { supabase, GalleryItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function GalleryManager() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error: any) {
      console.error('Error fetching gallery items:', error);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl && !imageFile) return;

    setLoading(true);
    try {
      let finalUrl = imageUrl;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.warn('Gallery upload fallback:', uploadError.message);
          finalUrl = URL.createObjectURL(imageFile);
        } else {
          const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName);
          finalUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from('gallery').insert([
        { image_url: finalUrl, title: title || undefined }
      ]);
      if (error) throw error;

      toast({ title: "Image added to gallery!" });
      setImageUrl('');
      setTitle('');
      setImageFile(null);
      fetchGalleryItems();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding gallery item",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;

      toast({ title: "Image deleted!" });
      fetchGalleryItems();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting image",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Add Gallery Image</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title / Caption (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Easter Celebration 2026"
            />
          </div>

          <div>
            <Label htmlFor="imageFile">Upload Image File</Label>
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="text-center font-medium text-xs text-gray-500">- OR -</div>

          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            {loading ? 'Uploading...' : 'Add Image'}
          </Button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Gallery Items</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {galleryItems.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden flex flex-col justify-between">
              <img
                src={item.image_url}
                alt={item.title || "Gallery Item"}
                className="w-full h-40 object-cover"
              />
              <div className="p-3 flex items-center justify-between bg-gray-50">
                <span className="text-sm truncate font-medium">{item.title || 'Untitled'}</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {galleryItems.length === 0 && (
            <p className="text-sm text-gray-500 italic col-span-full">No gallery items added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}