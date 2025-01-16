import { Users, Heart, Share2, BookOpenText } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface VerseOfDay {
  citation: string;
  passage: string;
  images: string[];
  version: string;
}

export const FeaturesSection = () => {
  const [verseOfDay, setVerseOfDay] = useState<VerseOfDay | null>(null);

  useEffect(() => {
    const fetchVerseOfDay = async () => {
      try {
        const response = await fetch('https://backend-church.vercel.app/api/verse-of-the-day'); // Your API endpoint
        const data = await response.json();
        setVerseOfDay(data);
      } catch (error) {
        console.error('Error fetching verse of the day:', error);
      }
    };

    fetchVerseOfDay();
  }, []);

  const handleShare = async () => {
    if (!verseOfDay) return;

    const shareText = `${verseOfDay.citation}: "${verseOfDay.passage}"\n\n#NiiBoimanCentralApp`;

    try {
      if (navigator.share) {
        await navigator.share({
          text: shareText
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('Verse copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <section className="py-24 bg-church-background">
      <div className="container mx-auto grid md:grid-cols-3 gap-12 px-4">
        {/* Verse of the Day */}
        <motion.div 
          className="p-6 pb-8 bg-white rounded-lg shadow-lg text-center"
          whileHover={{ scale: 1.05 }}
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 50 }}
          viewport={{ once: false }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 0.6
          }}
        >
          {verseOfDay && (
            <>
              <h3 className="text-2xl font-bold text-church-primary mb-2">Verse of the Day</h3>
              {verseOfDay.images.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <img 
                    src={verseOfDay.images[0]} 
                    alt="Verse of the Day" 
                    className="w-full h-auto mb-4 rounded-lg" 
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -50 }} // Start from the left
                  animate={{ opacity: 1, x: 0 }} // Fade in and slide to the center
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  <p className="text-lg italic text-church-text leading-relaxed">
                    "{verseOfDay.passage}"
                  </p>
                  <p className="text-sm font-medium text-church-secondary">
                    {verseOfDay.citation} <span className="ml-2">({verseOfDay.version})</span>
                  </p>
                </motion.div>
              )}
              <div className="mt-4">
                <Button
                  onClick={handleShare}
                  className="bg-church-primary text-white hover:bg-church-secondary transition-colors text-sm py-3 px-6 rounded-lg flex items-center gap-2 mx-auto"
                >
                  <Share2 className="w-4 h-4" />
                  Share Verse
                </Button>
              </div>
            </>
          )}
        </motion.div>

        {/* Connect */}
        <motion.div 
          className="p-6 pb-8 bg-white rounded-lg shadow-lg text-center"
          whileHover={{ scale: 1.05 }}
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 50 }}
          viewport={{ once: false }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 0.6
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Users className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold text-church-primary mb-2">CONNECT</h3>
          <p className="text-lg text-church-text mb-4">
            Be part of our vibrant community through various fellowship programs.
          </p>
        </motion.div>

        {/* God's Love */}
        <motion.div 
          className="p-6 pb-8 bg-white rounded-lg shadow-lg text-center"
          whileHover={{ scale: 1.05 }}
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 50 }}
          viewport={{ once: false }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 0.6
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Heart className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold text-church-primary mb-2">GOD'S LOVE</h3>
          <p className="text-lg text-church-text mb-4">
            Experience and share the transforming love of God in our community.
          </p>
        </motion.div>
      </div>
    </section>
  );
}; 