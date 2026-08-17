import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { MicVocal, Radio, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";
import { Navigation } from "./Navigation";
import { ChatButton } from "../ChatButton";
import { FooterSection } from './FooterSection';
import { ShareButton } from "@/components/ShareButton";
import { supabase, LiveEventItem } from '@/lib/supabase';
import LiveAudioPlayer from '../live/LiveAudioPlayer';

export const LiveServiceSection = () => {
  const [activeLiveEvent, setActiveLiveEvent] = useState<LiveEventItem | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    // Fetch on mount (and on realtime re-fetches). Only the initial call
    // should toggle the loading skeleton — subsequent re-fetches update
    // state quietly so the layout doesn't shift/jump on every row change.
    const fetchActiveEvent = async (isInitial = false) => {
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
        if (isInitial) {
          setLoadingEvent(false);
        }
      }
    };

    fetchActiveEvent(true);

    // Subscribe to live_events changes via Realtime for instant updates.
    // Deliberately unfiltered: a status filter would only match on the new
    // row for UPDATEs, so it would miss the live→ended transition (the row
    // stops matching the moment it ends) and the player could get stuck
    // showing "LIVE" after a broadcast actually stops.
    const channel = supabase
      .channel('live_events_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_events' },
        () => {
          // Re-fetch whenever any live_event row changes
          fetchActiveEvent(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
            </div>
          </div>
          <ShareButton 
            title="TAC Live Service"
            text="Join us for our live service at The Apostolic Church-Ghana, Nii Boiman Central"
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
            <div className="flex items-center gap-2 mb-4 bg-red-600 text-white px-4 py-2 rounded-lg w-fit animate-pulse font-bold text-sm">
              <Radio className="w-5 h-5" />
              <span>LIVE AUDIO EVENT IN PROGRESS</span>
            </div>
            <LiveAudioPlayer event={activeLiveEvent} />
          </div>
        ) : (
          <div className="mb-12">
            <div className="flex items-center justify-between gap-2 mb-4 bg-red-600 text-white px-4 py-2 rounded-xl w-full max-w-md mx-auto font-bold text-sm shadow-md">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 animate-pulse" />
                <span>LIVE AUDIO BROADCAST PREVIEW</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">DEMO MODE</span>
            </div>
            <LiveAudioPlayer event={activeLiveEvent || {
              id: 'demo-live-1',
              title: 'The Daily Creative: How to Scale Your Ideas',
              speaker: 'Alex',
              description: 'Live Audio Service & Discussion',
              status: 'live',
              agora_channel: 'tac_live_demo',
              started_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            }} />
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
      </div>
      <div>
        <ChatButton />
      </div>
      <FooterSection />
    </div>
  );
};