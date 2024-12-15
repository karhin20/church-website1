import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../../admin/auth/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const firestore = getFirebaseFirestore();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const announcementsCollection = collection(firestore, 'announcements');
      const announcementsSnapshot = await getDocs(announcementsCollection);
      const announcementsList = announcementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnnouncements(announcementsList);
    };

    fetchAnnouncements();
  }, [firestore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    await addDoc(collection(firestore, 'announcements'), { title });
    setTitle('');
    // Refresh announcements list
    fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(firestore, 'announcements', id));
    // Refresh announcements list
    fetchAnnouncements();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Label htmlFor="title">Announcement Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Button type="submit">Add Announcement</Button>
      </form>

      <ul>
        {announcements.map((announcement) => (
          <li key={announcement.id}>
            {announcement.title}
            <Button onClick={() => handleDelete(announcement.id)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  );
} 