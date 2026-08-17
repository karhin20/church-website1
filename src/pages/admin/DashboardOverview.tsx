import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MicVocal, MessageSquare, Image, Radio } from 'lucide-react';
import { getCache, setCache, TTL } from '@/lib/queryCache';

const STATS_KEY = 'dashboard-stats';

interface Stats {
  sermons: number;
  announcements: number;
  gallery: number;
  activeLiveEvents: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    sermons: 0,
    announcements: 0,
    gallery: 0,
    activeLiveEvents: 0,
  });

  useEffect(() => {
    // Serve from memory cache if still fresh (2-minute TTL)
    const cached = getCache<Stats>(STATS_KEY);
    if (cached) {
      setStats(cached);
      return;
    }

    const fetchStats = async () => {
      try {
        // Run all 4 count queries concurrently instead of sequentially
        const [
          { count: sermonsCount },
          { count: announcementsCount },
          { count: galleryCount },
          { count: liveCount },
        ] = await Promise.all([
          supabase.from('sermons').select('*', { count: 'exact', head: true }),
          supabase.from('announcements').select('*', { count: 'exact', head: true }),
          supabase.from('gallery').select('*', { count: 'exact', head: true }),
          supabase.from('live_events').select('*', { count: 'exact', head: true }).eq('status', 'live'),
        ]);

        const newStats: Stats = {
          sermons: sermonsCount || 0,
          announcements: announcementsCount || 0,
          gallery: galleryCount || 0,
          activeLiveEvents: liveCount || 0,
        };
        setCache(STATS_KEY, newStats, TTL.DASHBOARD_STATS);
        setStats(newStats);
      } catch (err) {
        console.error('Error fetching dashboard stats from Supabase:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-4">
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

      <Card className={stats.activeLiveEvents > 0 ? "border-red-500 bg-red-50/20" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Live Streams</CardTitle>
          <Radio className={`h-4 w-4 ${stats.activeLiveEvents > 0 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeLiveEvents}</div>
          {stats.activeLiveEvents > 0 && (
            <p className="text-xs text-red-600 font-semibold mt-1 animate-pulse">Live stream in progress!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}