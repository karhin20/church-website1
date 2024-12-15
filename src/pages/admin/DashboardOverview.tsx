import { useEffect, useState } from 'react';
import { getFirebaseFirestore } from '../../admin/auth/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MicVocal, MessageSquare, Image } from 'lucide-react';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    sermons: 0,
    announcements: 0,
    gallery: 0,
  });

  const firestore = getFirebaseFirestore();

  useEffect(() => {
    const fetchStats = async () => {
      const sermonsCount = (await getDocs(collection(firestore, 'sermons'))).size;
      const announcementsCount = (await getDocs(collection(firestore, 'announcements'))).size;
      const galleryCount = (await getDocs(collection(firestore, 'gallery'))).size;

      setStats({
        sermons: sermonsCount,
        announcements: announcementsCount,
        gallery: galleryCount,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sermons</CardTitle>
          <MicVocal className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.sermons}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Announcements</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.announcements}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gallery Images</CardTitle>
          <Image className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.gallery}</div>
        </CardContent>
      </Card>
    </div>
  );
} 