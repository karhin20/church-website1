import { useEffect, useState } from 'react';
import { supabase, AnnouncementItem } from '@/lib/supabase';
import { Bell } from 'lucide-react';
import { getCache, setCache, TTL } from '@/lib/queryCache';

const ANNOUNCEMENTS_KEY = 'announcements';

export const AnnouncementsSection = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  useEffect(() => {
    // Serve from memory cache if still fresh
    const cached = getCache<AnnouncementItem[]>(ANNOUNCEMENTS_KEY);
    if (cached) {
      setAnnouncements(cached);
      return;
    }

    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setCache(ANNOUNCEMENTS_KEY, data, TTL.ANNOUNCEMENTS);
          setAnnouncements(data);
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-church-primary mb-4">Announcements</h2>
        <p className="text-center text-church-text mb-12">Stay updated with our latest church news & notices</p>

        {announcements.length > 0 && (
          <div className="max-w-3xl mx-auto mb-10 space-y-3">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-church-background border border-church-secondary/30 rounded-lg shadow-sm flex items-start gap-3"
              >
                <Bell className="w-5 h-5 text-church-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-church-primary">{item.title}</h4>
                  {item.content && <p className="text-sm text-gray-600 mt-1">{item.content}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <div className="aspect-video w-full max-w-3xl">
            <iframe
              className="w-full h-full rounded-lg shadow-lg"
              src="https://www.youtube.com/embed/j72jOk9489w" 
              title="Church Announcements Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};
