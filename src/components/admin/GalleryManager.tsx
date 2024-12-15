import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../../admin/auth/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function GalleryManager() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const firestore = getFirebaseFirestore();

  useEffect(() => {
    const fetchGalleryItems = async () => {
      const galleryCollection = collection(firestore, 'gallery');
      const gallerySnapshot = await getDocs(galleryCollection);
      const galleryList = gallerySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGalleryItems(galleryList);
    };

    fetchGalleryItems();
  }, [firestore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    await addDoc(collection(firestore, 'gallery'), { imageUrl });
    setImageUrl('');
    // Refresh gallery items list
    fetchGalleryItems();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(firestore, 'gallery', id));
    // Refresh gallery items list
    fetchGalleryItems();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        <Button type="submit">Add Image</Button>
      </form>

      <ul>
        {galleryItems.map((item) => (
          <li key={item.id}>
            <img src={item.imageUrl} alt="Gallery Item" />
            <Button onClick={() => handleDelete(item.id)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  );
} 