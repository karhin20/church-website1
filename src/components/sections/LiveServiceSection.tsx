import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Music4, BookPlus, MicVocal, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Navigation } from "./Navigation";
import { ChatButton } from "../ChatButton";

export const LiveServiceSection = () => {
  return (
    <div className="min-h-screen bg-church-background pt-20">
      <Navigation />
      {/* Live Stream Container */}
      <div className="container mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 flex items-center justify-center gap-4"
        >
          <MicVocal className="w-14 h-14 text-church-primary" />
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-church-primary mb-1 text-left">Live Service</h2>
            <p className="text-church-text text-left">Join us for our live service</p>
          </div>
        </motion.div>


          {/* Video 
         <div className="aspect-video w-full max-w-4xl mx-auto mb-16">
          <iframe
            className="w-full h-full rounded-lg shadow-lg"
            src="https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID"
            title="Church Live Stream"
            allowFullScreen
          ></iframe>
        </div>

        Embed Container */}

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
        <div>
            <ChatButton />
        </div>
      </div>
    </div>
  );
};