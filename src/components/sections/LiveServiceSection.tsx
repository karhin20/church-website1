import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Music4, BookPlus, MicVocal, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "./Navigation";
import { ChatButton } from "../ChatButton";
import { VerseReader } from '@/pages/VerseReader';
import { FooterSection } from './FooterSection';

export const LiveServiceSection = () => {
  const [isVerseReaderOpen, setIsVerseReaderOpen] = useState(false);

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

        {/* Grid container with Podbean and Support */}
        <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto mb-8">
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

        {/* Verse Reader Toggle Button and Content */}
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setIsVerseReaderOpen(!isVerseReaderOpen)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="text-lg font-semibold text-church-primary">
              Bible Verse Reader
            </span>
            {isVerseReaderOpen ? (
              <ChevronUp className="w-6 h-6 text-church-primary" />
            ) : (
              <ChevronDown className="w-6 h-6 text-church-primary" />
            )}
          </button>

          <AnimatePresence>
            {isVerseReaderOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-4">
                  <VerseReader />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
        <div>
            <ChatButton />
        </div>
        <FooterSection />
    </div>
  );
};