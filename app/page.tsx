'use client';

import React, { useState } from 'react';
import { SplashScreen } from '@/components/SplashScreen';
import { ProductCanvas } from '@/components/ProductCanvas';
import { QuoteDrawer } from '@/components/QuoteDrawer';
import { RotateCcw } from 'lucide-react';
import { studioAudio } from '@/lib/audio';

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleReplaySplash = () => {
    setShowSplash(true);
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-[#E5E5E5] overflow-x-hidden font-sans">
      {/* Dynamic Splash Screen with WebP Sequence Simulation */}
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <div className="animate-fadeIn relative min-h-screen">
          {/* Main 3D Floating Non-Grid Product Canvas (Contains Scoped Hero 3D Animation) */}
          <ProductCanvas />

          {/* Global Quote Drawer with Zustand State & WhatsApp Integration (z-50) */}
          <QuoteDrawer />

          {/* Quick Replay Splash Screen Floating Utility Button (Floating bottom-left) */}
          <div className="fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-40 origin-bottom-left scale-[0.8] sm:scale-100">
            <button
              type="button"
              id="replay-splash-button"
              onClick={handleReplaySplash}
              aria-label="Reiniciar Intro"
              className="group flex items-center space-x-2.5 px-3 py-1.5 sm:px-4 sm:py-2 border border-white/15 bg-black/80 hover:bg-white/10 text-white/70 hover:text-white shadow-2xl backdrop-blur-md transition-all duration-200 text-[9px] font-mono tracking-[0.25em] uppercase rounded-full cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 group-hover:-rotate-90 transition-transform duration-300" />
              <span>REPLAY INTRO</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



