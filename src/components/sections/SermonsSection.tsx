import { useEffect, useState } from "react";
import { Play, ArrowRight, Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RedCirclePlayer } from '@/components/RedCirclePlayer';
import { motion } from "framer-motion";
import { supabase, SermonItem } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export const SermonsSection = () => {
  const [dbSermons, setDbSermons] = useState<SermonItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestThreeSermons = async () => {
      try {
        const { data, error } = await supabase
          .from('sermons')
          .select('*')
          .or('is_hidden.is.null,is_hidden.eq.false')
          .order('date', { ascending: false })
          .limit(3);

        if (!error && data && data.length > 0) {
          setDbSermons(data);
        }
      } catch (err) {
        console.error('Error fetching latest 3 sermons for home section:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestThreeSermons();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false },
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6 
    }
  };

  const defaultSermons = [
    {
      id: 'default-1',
      title: "Catch The Glory Conference 2024",
      preacher: "Pastor Ebo Ansah Awotwi",
      date: "August 18, 2024",
      audioUrl: "https://stream.redcircle.com/episodes/da3067b9-91b1-4e75-aae0-435b666eef57/stream.mp3",
      speakerImage: "https://media.redcircle.com/images/2025/1/6/9/6335cc53-7413-49ec-98fd-ac27ee37e753_18619985-1736112364643-8b27f46b06a0e.jpg?d=440x440"
    },
    {
      id: 'default-2',
      title: "Benefits of the Resurrection A",
      preacher: "Apostle J. K. Atinyo",
      date: "March 31, 2024",
      audioUrl: "https://stream.redcircle.com/episodes/362dda22-9b34-4bf3-8fda-9ce42481f30b/stream.mp3",
      speakerImage: "https://media.redcircle.com/images/2025/1/6/9/288911b1-7f78-451b-9257-310b6ac14b64_18619985-1736111878446-25f831a598b9.jpg?d=440x440"
    },
    {
      id: 'default-3',
      title: "Giving",
      preacher: "Pastor Richard Mensah",
      date: "February 14, 2024",
      audioUrl: "https://stream.redcircle.com/episodes/ed209ace-ab9f-43ac-a02b-9d8ed651e20b/stream.mp3",
      speakerImage: "https://media.redcircle.com/images/2025/1/6/9/de5a1819-c6ff-42c4-a171-f2ec3c478fb2_18619985-1634160731906-274fa4dcd87fa.jpg?d=440x440"
    }
  ];

  const sermonsToDisplay = dbSermons.length > 0 ? dbSermons.slice(0, 3) : defaultSermons;

  return (
    <section id="sermons" className="py-24 bg-church-primary text-white font-sans">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 0.6 
          }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-church-secondary/20 text-church-secondary text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider mb-3">
            <Disc3 className="w-4 h-4 animate-spin [animation-duration:8s]" />
            <span>RECORDED MESSAGES</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">
            Latest Sermons
          </h2>
          <p className="text-church-accent max-w-lg mx-auto text-sm md:text-base">
            Listen to our 3 most recent recorded messages and spiritual teachings.
          </p>
        </motion.div>

        {/* 3 Latest Sermons Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {sermonsToDisplay.map((sermon, idx) => {
            const title = 'title' in sermon ? sermon.title : '';
            const preacher = 'preacher' in sermon ? sermon.preacher : '';
            const dateStr = 'date' in sermon && sermon.date 
              ? (isNaN(Date.parse(sermon.date)) ? sermon.date : new Date(sermon.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
              : '';
            const audioUrl = getCloudinaryUrl('audio_url' in sermon ? (sermon as SermonItem).audio_url : (sermon as any).audioUrl);
            const speakerImage = (sermon as any).speakerImage;

            return (
              <motion.div 
                key={sermon.id}
                className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/10 flex flex-col justify-between hover:border-church-secondary/40 transition-all shadow-xl"
                {...fadeInUp}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
              >
                <div>
                  <div className="text-[11px] font-bold text-church-secondary uppercase tracking-wider mb-1">
                    {dateStr || 'Sermon'}
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-white line-clamp-2 leading-snug">
                    {title}
                  </h4>
                  <p className="text-church-accent mb-4 text-xs font-semibold">
                    By {preacher}
                  </p> 
                  {'description' in sermon && sermon.description && (
                    <p className="text-gray-300 text-xs mb-4 line-clamp-2 leading-relaxed">
                      {sermon.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <RedCirclePlayer 
                    audioUrl={audioUrl}
                    speakerImage={speakerImage}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* More Sermons Button */}
        <motion.div 
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/sermons">
            <Button 
              className="bg-church-secondary text-church-primary hover:bg-white font-bold px-8 py-6 text-base rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
            >
              <span>More Sermons</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};