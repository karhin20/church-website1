import { Users, Heart, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface VerseOfDay {
  citation?: string;
  passage?: string;
  images?: string[];
  version?: string;
}

export const FeaturesSection = () => {
  const [verseOfDay, setVerseOfDay] = useState<VerseOfDay | null>(null);
  const [isImageOpen, setIsImageOpen] = useState(false);

  useEffect(() => {
    const fetchVerseOfDay = async () => {
      try {
        const isDev = import.meta.env.DEV;
        const url = isDev ? '/api/verse-of-the-day' : 'https://backend-church.vercel.app/api/verse-of-the-day';
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data && data.passage) {
            setVerseOfDay(data);
          }
        }
      } catch (error) {
        console.error('Error fetching verse of the day:', error);
      }
    };

    fetchVerseOfDay();
  }, []);

  const handleShare = async () => {
    if (!verseOfDay || !verseOfDay.passage) return;

    const shareText = `${verseOfDay.citation || 'Bible Verse'}: "${verseOfDay.passage}"\n\n#NiiBoimanCentralApp`;

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

  const handleImageClick = () => {
    setIsImageOpen(true);
  };

  const closeImageModal = () => {
    setIsImageOpen(false);
  };

  const hasImages = Array.isArray(verseOfDay?.images) && verseOfDay.images.length > 0;

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
          <h3 className="text-2xl font-bold text-church-primary mb-2">Verse of the Day</h3>
          {verseOfDay && verseOfDay.passage ? (
            <>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <p className="text-lg italic text-church-text leading-relaxed">
                  "{verseOfDay.passage}"
                </p>
                <p className="text-sm font-medium text-church-secondary">
                  {verseOfDay.citation} {verseOfDay.version && <span className="ml-2">({verseOfDay.version})</span>}
                </p>
              </motion.div>
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  onClick={handleShare}
                  className="bg-church-primary text-white hover:bg-church-secondary transition-colors text-sm py-3 px-6 rounded-lg flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Verse
                </Button>
                {hasImages && (
                  <Button
                    onClick={handleImageClick}
                    className="bg-church-secondary text-white hover:bg-church-primary transition-colors text-sm py-3 px-6 rounded-lg flex items-center gap-2"
                  >
                    View Image
                  </Button>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic text-sm mt-4">
              "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life." — John 3:16
            </p>
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

      {/* Fullscreen Image Modal */}
      {isImageOpen && hasImages && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative">
            <button onClick={closeImageModal} className="absolute top-2 right-2 text-white text-2xl">✖</button>
            <img 
              src={verseOfDay!.images![0]} 
              alt="Verse of the Day" 
              className="max-w-full max-h-full object-contain" 
            />
          </div>
        </div>
      )}
    </section>
  );
};