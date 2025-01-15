import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Music4, BookPlus, MicVocal, Calendar, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "./Navigation";
import { ChatButton } from "../ChatButton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  },
};

const pulseVariants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const OfflineServiceSection = () => {
  return (
    <AnimatePresence>
      <div className="min-h-screen bg-church-background pt-20 relative">
        <Navigation />
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 mb-16"
        >
          {/* Header Section */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-12 flex items-center justify-center gap-4"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                transition: { duration: 2, repeat: Infinity }
              }}
            >
              <MicVocal className="w-14 h-14 text-church-primary" />
            </motion.div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-church-primary mb-1 text-left">Live Service</h2>
              <div className="flex items-center gap-2 text-left">
                <motion.div
                  variants={pulseVariants}
                  initial="initial"
                  animate="pulse"
                  className="w-3 h-3 rounded-full bg-gray-400"
                />
                <p className="text-church-text">Currently Offline</p>
              </div>
            </div>
          </motion.div>

          {/* Offline Message */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto mb-12"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <h3 className="text-2xl font-bold text-church-primary mb-4">
              Service is Currently Offline
            </h3>
            <motion.div 
              className="flex items-center justify-center gap-3 mb-6"
              whileHover={{ x: 5 }}
            >
              <Calendar className="w-6 h-6 text-church-primary" />
              <p className="text-church-text">Next live service: Sunday at 7:00 AM GMT</p>
            </motion.div>
            <div className="text-sm text-gray-600 mb-6">
              Join us then for live worship and the Word of God
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
            </motion.div>
          </motion.div>

          {/* Support Section */}
          <motion.div
            variants={itemVariants}
            className="bg-church-secondary rounded-lg shadow-md p-6 max-w-2xl mx-auto mb-16"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <h4 className="text-md font-semibold font-serif text-center mb-4">
              Contribute to God's Work
            </h4>
            <p className="text-base font-medium mb-3 text-center">
              MOMO NUMBER: <strong className="text-lg">0597672546</strong>
            </p>
            <p className="text-sm text-center">
              ACCOUNT NAME: <strong>THE TAC AHWC NII BOIMAN</strong>
            </p>
          </motion.div>
        </motion.div>

        {/* Resources Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-church-primary py-16 px-4"
        >
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Hymn Card */}
            <motion.div 
              variants={itemVariants}
              className="p-6 pb-8 bg-white rounded-lg shadow-lg text-center"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  transition: { duration: 2, repeat: Infinity }
                }}
              >
                <Music4 className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
              </motion.div>
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
              variants={itemVariants}
              className="p-6 pb-8 bg-white rounded-lg shadow-lg text-center"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  transition: { duration: 2, repeat: Infinity, delay: 0.5 }
                }}
              >
                <BookPlus className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-church-primary mb-2">THE BIBLE</h3>
              <p className="text-lg text-church-text mb-4">Read and study the Word of God in multiple languages.</p> 
              <Link to="/bible">
                <Button className="bg-church-primary text-white hover:bg-church-secondary transition-colors text-xl py-3 px-6 rounded-lg">
                  Read Bible
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
        <div>
            <ChatButton />
        </div>
      </div>
    </AnimatePresence>
  );
}; 