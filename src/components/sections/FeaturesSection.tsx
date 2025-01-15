import { Users, Heart, Share2, BookOpenText } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BibleVerse {
  random_verse: {
    book: string;
    chapter: number;
    verse: number;
    text: string;
  };
  translation: {
    name: string;
  };
}

export const FeaturesSection = () => {
  const [verseOfDay, setVerseOfDay] = useState<BibleVerse | null>(null);

  useEffect(() => {
    fetch('https://bible-api.com/data/web/random/NT')
      .then(res => res.json())
      .then(data => setVerseOfDay(data))
      .catch(err => console.error('Error fetching verse:', err));
  }, []);

  const handleShare = async () => {
    if (!verseOfDay) return;

    const shareText = `${verseOfDay.random_verse.text.trim()}\n\n${verseOfDay.random_verse.book} ${verseOfDay.random_verse.chapter}:${verseOfDay.random_verse.verse} (${verseOfDay.translation.name})\n\n#NiiBoimanCentralApp`;

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
            <BookOpenText className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold text-church-primary mb-2">KNOW YOUR BIBLE</h3>
          {verseOfDay && (
            <div className="space-y-4">
              <p className="text-lg italic text-church-text leading-relaxed">
                "{verseOfDay.random_verse.text.trim()}"
              </p>
              <p className="text-sm font-medium text-church-secondary">
                {verseOfDay.random_verse.book} {verseOfDay.random_verse.chapter}:{verseOfDay.random_verse.verse} 
                <span className="ml-2">({verseOfDay.translation.name})</span>
              </p>
              <div className="mt-4">
                <Button
                  onClick={handleShare}
                  className="bg-church-primary text-white hover:bg-church-secondary transition-colors text-sm py-3 px-6 rounded-lg flex items-center gap-2 mx-auto"
                >
                  <Share2 className="w-4 h-4" />
                  Share Verse
                </Button>
              </div>
            </div>
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