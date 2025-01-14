import { Users, Heart, Share2 } from "lucide-react";
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
          className="text-center p-8 rounded-xl bg-white shadow-lg border border-gray-100"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-2xl font-bold mb-4 text-church-primary">VERSE OF THE DAY</h3>
          {verseOfDay && (
            <div className="space-y-4">
              <p className="text-lg italic text-church-text leading-relaxed">
                "{verseOfDay.random_verse.text.trim()}"
              </p>
              <p className="text-sm font-medium text-church-secondary">
                {verseOfDay.random_verse.book} {verseOfDay.random_verse.chapter}:{verseOfDay.random_verse.verse} 
                <span className="ml-2">({verseOfDay.translation.name})</span>
              </p>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleShare}
                  className="mt-4 flex items-center text-church-primary gap-2 mx-auto"
                  variant="outline"
                >
                  <Share2 className="w-4 h-4 text-church-primary"/>
                  Share Verse
                </Button>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Connect */}
        <motion.div 
          className="text-center group p-8 rounded-xl bg-white shadow-lg border border-gray-100"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-center mb-6">
            <Users className="w-16 h-16 text-church-secondary group-hover:text-church-primary transition-colors duration-300" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-church-primary">CONNECT</h3>
          <p className="text-church-text leading-relaxed">
            Be part of our vibrant community through various fellowship programs.
          </p>
        </motion.div>

        {/* God's Love */}
        <motion.div 
          className="text-center group p-8 rounded-xl bg-white shadow-lg border border-gray-100"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-center mb-6">
            <Heart className="w-16 h-16 text-church-secondary group-hover:text-church-primary transition-colors duration-300" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-church-primary">GOD'S LOVE</h3>
          <p className="text-church-text leading-relaxed">
            Experience and share the transforming love of God in our community.
          </p>
        </motion.div>
      </div>
    </section>
  );
}; 