import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Music4, BookPlus, MicVocal } from "lucide-react";
import { motion } from "framer-motion";
import { Navigation } from "./Navigation";
import { useState, useEffect } from "react";

export const LiveServiceSection = () => {
  const [isLive, setIsLive] = useState(false);
  
  const NotLiveMessage = () => (
    <div className="container mx-auto px-4 text-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-church-primary mb-4">
          Service is Currently Offline
        </h3>
        <p className="text-church-text mb-4">
          Our next live service will be on Sunday at 7:00 AM GMT
        </p>
        <div className="text-sm text-gray-600">
          Join us then for live worship and the Word of God
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-church-background pt-20">
      <Navigation />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 container mx-auto px-4 flex items-center justify-center gap-4"
      >
        <MicVocal className="w-14 h-14 text-church-primary" />
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-church-primary mb-1 text-left">Live Service</h2>
          <div className="flex items-center gap-2 text-left">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <p className="text-church-text">
              {isLive ? 'Live Now' : 'Currently Offline'}
            </p>
          </div>
        </div>
      </motion.div>

      {isLive ? (
        <div className="container mx-auto px-4 mb-16">
          {/* Optional Video Streaming Section - Uncomment and configure as needed */}
          {/* 
          <div className="max-w-4xl mx-auto mb-8">
            <div className="aspect-video w-full">
              <!-- YouTube Embed -->
              <iframe
                className="w-full h-full rounded-lg shadow-lg"
                src="https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID"
                title="Church Live Stream"
                allowFullScreen
              ></iframe>

              <!-- Facebook Embed -->
              <iframe
                className="w-full h-full rounded-lg shadow-lg"
                src="https://www.facebook.com/plugins/video.php?href=YOUR_FACEBOOK_VIDEO_URL"
                title="Church Live Stream"
                scrolling="no"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              ></iframe>
            </div>
          </div>
          */}

          {/* Grid container with Podbean and Support */}
          <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto mb-16">
            {/* Podbean player taking 3/5 of the space */}
            <div className="md:col-span-3 bg-white rounded-lg shadow-md p-4">
              <iframe
                height="150" 
                width="100%" 
                style={{ border: 'none' }} 
                scrolling="no" 
                data-name="pb-iframe-player" 
                src="https://www.podbean.com/live-player/?channel_id=WXPoH0puz9" 
                referrerPolicy="no-referrer-when-downgrade" 
                allow="autoplay" 
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                allowFullScreen
              />
            </div>

            {/* Support section taking 2/5 of the space */}
            <div className="md:col-span-2 bg-church-secondary rounded-lg shadow-md p-6">
              <h4 className="text-md font-semibold font-serif text-center mb-4">
                Contribute to God's Work
              </h4>
              <p className="text-base font-medium mb-3">
                MOMO NUMBER: <strong className="text-lg">0597672546</strong>
              </p>
              <p className="text-sm">
                ACCOUNT NAME: <strong className="text-sm">THE TAC AHWC NII BOIMAN</strong>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <NotLiveMessage />
      )}

      {/* Hymn and Bible Section */}
      <div className="bg-church-primary py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Hymn Card */}
          <motion.div 
            className="p-6 pb-8 bg-white rounded-lg shadow-lg text-center"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
          >
            <Music4 className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-church-primary mb-2">TAC Hymns</h3>
            <p className="text-lg text-church-text mb-4">Explore our rich collection of spiritual hymns.</p> 
            <Link to="/hymns">
              <Button className="bg-church-primary text-white hover:bg-church-secondary transition-colors text-xl py-3 px-6 rounded-lg">
                View Hymns
              </Button>
            </Link>
          </motion.div>

          {/* Bible Card */}
          <motion.div 
            className="p-6 pb-8 bg-white rounded-lg shadow-lg text-center"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
          >
            <BookPlus className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-church-primary mb-2">THE BIBLE</h3>
            <p className="text-lg text-church-text mb-4">Read and study the Word of God in multiple languages.</p> 
            <Link to="/bible">
              <Button className="bg-church-primary text-white hover:bg-church-secondary transition-colors text-xl py-3 px-6 rounded-lg">
                Read Bible
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};