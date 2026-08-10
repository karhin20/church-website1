import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MicVocal, ChevronDown, ChevronUp, Radio, HeartHandshake } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "./Navigation";
import { ChatButton } from "../ChatButton";
import { VerseReader } from '@/pages/VerseReader';
import { FooterSection } from './FooterSection';
import { ShareButton } from "@/components/ShareButton";
import { supabase, LiveEventItem } from '@/lib/supabase';
import LiveAudioPlayer from '../live/LiveAudioPlayer';

export const LiveServiceSection = () => {
  const [isVerseReaderOpen, setIsVerseReaderOpen] = useState(false);
  const [activeLiveEvent, setActiveLiveEvent] = useState<LiveEventItem | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Keep a ref to the current active event ID to prevent stale closures in callbacks
  const activeEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeEventIdRef.current = activeLiveEvent ? activeLiveEvent.id : null;
  }, [activeLiveEvent]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const fetchActiveEvent = async () => {
      const currentId = activeEventIdRef.current;

      // 1. If we are currently watching an active event, check if its status changed
      if (currentId) {
        try {
          const { data, error } = await supabase
            .from('live_events')
            .select('*')
            .eq('id', currentId)
            .single();

          if (!error && data) {
            if (data.status === 'live') {
              setActiveLiveEvent(data);
              return;
            } else {
              // The current event ended. Check if a new live event was started.
              const { data: newLive, error: newLiveErr } = await supabase
                .from('live_events')
                .select('*')
                .eq('status', 'live')
                .order('started_at', { ascending: false })
                .limit(1);

              if (!newLiveErr && newLive && newLive.length > 0) {
                setActiveLiveEvent(newLive[0]);
              } else {
                setActiveLiveEvent(data); // Keep the ended event in state so the player displays the Ended banner
              }
              return;
            }
          }
        } catch (err) {
          console.error('Error checking active live event status:', err);
        }
      }

      // 2. Otherwise (or if status check failed), look for the latest live event
      try {
        const { data, error } = await supabase
          .from('live_events')
          .select('*')
          .eq('status', 'live')
          .order('started_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          setActiveLiveEvent(data[0]);
        } else {
          setActiveLiveEvent(null);
        }
      } catch (err) {
        console.error('Error fetching live event in LiveServiceSection:', err);
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchActiveEvent();

    // ── Supabase Realtime subscription ──────────────────────────────────────
    const channel = supabase
      .channel('live_events_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_events' },
        () => {
          fetchActiveEvent();
        }
      )
      .subscribe();

    // ── Polling Fallback (4 s) ──────────────────────────────────────────────
    // Guarantees status updates even if Realtime events are delayed or dropped.
    const interval = setInterval(fetchActiveEvent, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-church-background pt-20">
      <Navigation />
      {/* Live Stream Container */}
      <div className="container mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <MicVocal className="w-14 h-14 text-church-primary" />
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-church-primary mb-1 text-left">Live Service</h2>
              <p className="text-church-text text-left">Join us for our live listening cloud & worship</p>
            </div>
          </div>
          <ShareButton 
            title="TAC Live Service"
            text="Join us for our live service at The Apostolic Church - Ghana"
          />
        </motion.div>

        {/* Agora Live Streaming Section */}
        {loadingEvent ? (
          <div className="mb-8 p-6 bg-white border rounded-xl shadow-sm text-center max-w-6xl mx-auto flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : activeLiveEvent ? (
          <div className="mb-12">
            {activeLiveEvent.status === 'live' && (
              <div className="flex items-center gap-2 mb-4 bg-red-600 text-white px-4 py-2 rounded-lg w-fit animate-pulse font-bold text-sm">
                <Radio className="w-5 h-5" />
                <span>LIVE AUDIO EVENT IN PROGRESS</span>
              </div>
            )}
            <LiveAudioPlayer event={activeLiveEvent} />
          </div>
        ) : (
          <div className="mb-8 p-6 bg-white border rounded-xl shadow-sm text-center max-w-6xl mx-auto space-y-2">
            <Radio className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-xl font-bold text-church-primary">No Live Service Currently Broadcasting</h3>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              Our live audio stream starts when an admin opens the live broadcast. Check back during service times (Sundays at 7:00 AM & 9:00 AM)!
            </p>
          </div>
        )}

        {/* Support & Giving Section */}
        <div className="max-w-6xl mx-auto mb-8 bg-gradient-to-r from-church-secondary via-amber-400 to-church-secondary rounded-xl shadow-md p-6 text-church-primary flex flex-col md:flex-row items-center justify-between gap-4 border border-yellow-500/20">
          <div className="flex items-center gap-4">
            <HeartHandshake className="w-10 h-10 text-church-primary flex-shrink-0" />
            <div>
              <h4 className="text-lg font-bold font-serif">Contribute to God's Work</h4>
              <p className="text-sm opacity-90">Support Nii Boiman Central Assembly through Mobile Money</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-lg text-center md:text-right border">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">MOMO NUMBER</p>
            <p className="text-xl font-bold font-mono text-church-primary">0597672546</p>
            <p className="text-xs text-gray-700 font-medium">ACCOUNT: THE TAC AHWC NII BOIMAN</p>
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