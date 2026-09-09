/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { studioAudio } from '@/lib/audio';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const textPromptRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);

  const [isStarting, setIsStarting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Floating & rotation ambient animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Breathing ambient core glow
      if (ambientGlowRef.current) {
        gsap.to(ambientGlowRef.current, {
          scale: 1.1,
          opacity: 0.6,
          duration: 2.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // Entrance animation for logo and text
      const tl = gsap.timeline();
      tl.fromTo(
        logoContainerRef.current,
        { scale: 0.8, opacity: 0, rotation: -3 },
        { scale: 1, opacity: 1, rotation: 0, duration: 1.2, ease: 'power3.out' }
      )
        .fromTo(
          textPromptRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
          '-=0.8'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // RGB Vortex Swirl Canvas Loop with High Particle Density (Triggered only when isStarting is true)
  useEffect(() => {
    if (!isStarting) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    // Generate static particle offsets for richer vortex density
    const particles = Array.from({ length: 80 }, () => ({
      dist: Math.random() * 400 + 30,
      speed: (Math.random() * 0.03 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
      size: Math.random() * 2.5 + 1,
      color: ['#00BFFF', '#FF00FF', '#FF4500', '#FFD700'][Math.floor(Math.random() * 4)],
      offsetAngle: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      const w = (canvas.width = window.innerWidth);
      const h = (canvas.height = window.innerHeight);
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      angle += 0.015;
      const maxRadius = Math.max(w, h) * 0.9;

      ctx.save();
      ctx.translate(cx, cy);

      // Draw rich RGB vortex swirl rays & aperture blades (increased density)
      const blades = 48;
      for (let i = 0; i < blades; i++) {
        const bladeAngle = (i * Math.PI * 2) / blades + angle * 1.2;
        const x1 = Math.cos(bladeAngle) * 30;
        const y1 = Math.sin(bladeAngle) * 30;
        const x2 = Math.cos(bladeAngle + 0.6) * maxRadius;
        const y2 = Math.sin(bladeAngle + 0.6) * maxRadius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        // RGB color cycle
        const colors = ['#00BFFF', '#FF00FF', '#FF4500', '#FFD700'];
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.45;
        ctx.stroke();
      }

      // Render dense orbiting vortex particles
      particles.forEach((p) => {
        const currentAngle = p.offsetAngle + angle * p.speed * 15;
        const px = Math.cos(currentAngle) * p.dist;
        const py = Math.sin(currentAngle) * p.dist;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.8;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Concentric glowing RGB holographic rings expanding outward
      for (let r = 60; r < maxRadius; r += 40) {
        ctx.beginPath();
        ctx.arc(0, 0, r + (angle * 15) % 40, 0, Math.PI * 2);
        ctx.strokeStyle = r % 80 === 0 ? 'rgba(0, 191, 255, 0.4)' : 'rgba(255, 0, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 14]);
        ctx.stroke();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isStarting]);

  const handleStartSequence = () => {
    if (isStarting) return;
    setIsStarting(true);
    studioAudio.playClick();
    studioAudio.playApertureSequence();

    // GSAP Unified Exit Timeline with fluid zoom-in and longer duration
    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();
      },
    });

    // 1. Target logoContainerRef: fluid zoom-in (scale: 2.2), opacity: 0, duration: 1.6s, ease: "power2.inOut"
    tl.to(
      logoContainerRef.current,
      {
        scale: 2.2,
        opacity: 0,
        duration: 1.6,
        ease: 'power2.inOut',
      },
      0.1
    );

    // 2. Simultaneously, button and bottom texts fade down
    tl.to(
      textPromptRef.current,
      {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
      },
      0
    );
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 15;
    const y = (clientY / innerHeight - 0.5) * 15;
    setMousePos({ x, y });
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    studioAudio.setMuted(nextMuted);
    if (!nextMuted) {
      studioAudio.playClick();
    }
  };

  return (
    <div
      ref={containerRef}
      id="mka-splash-screen"
      onMouseMove={handleMouseMove}
      onClick={handleStartSequence}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between select-none cursor-pointer bg-[#000000] text-white overflow-hidden p-6 md:p-12 font-sans"
    >
      {/* Background Canvas for RGB Vortex Swirl Animation with high particle density */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${
          isStarting ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* High Contrast Deep Black Radial Vignette Mask */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-radial from-transparent via-black/80 to-[#000000] rounded-full blur-2xl opacity-90 pointer-events-none z-10" />
      
      {/* Outer Editorial Framing Border */}
      <div className="absolute inset-0 pointer-events-none border border-white/10 m-3 md:m-6 z-30" />

      {/* Ambient subtle glow */}
      <div
        ref={ambientGlowRef}
        style={{
          transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
        }}
        className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-sky-500/[0.03] blur-3xl pointer-events-none z-10"
      />

      {/* Top Editorial Nav Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-20">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-bold tracking-[0.25em] uppercase text-white font-sans">
              MKA
            </span>
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-white/60 font-sans -mt-1">
              Studio
            </span>
          </div>
          <div className="hidden sm:block h-6 w-[1px] bg-white/20" />
          <span className="hidden sm:inline-block text-[9px] uppercase tracking-[0.35em] text-white/50 font-mono">
            Catalogue N.042
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <span className="hidden md:inline-block text-[9px] uppercase tracking-[0.3em] font-medium text-white/40">
            Series 01 &bull; 3D Space
          </span>
          <button
            type="button"
            id="splash-sound-toggle"
            onClick={toggleSound}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all duration-200"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Center: Perfectly Centered Logo & RGB Outer Border with shadow */}
      <div
        ref={logoContainerRef}
        className="relative flex flex-col items-center justify-center my-auto z-20"
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Outer Circular Emblem with RGB Conic Gradient strictly on the outer border & shadow */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
          {/* Animated RGB Glow Ring (Border only) */}
          <div className="absolute inset-0 rounded-full p-[3px] animate-[spin_4s_linear_infinite] bg-[conic-gradient(#00BFFF,#FF00FF,#FF4500,#FFD700,#00BFFF)] blur-[10px] opacity-90 shadow-[0_0_40px_rgba(0,191,255,0.3)]" />
          {/* Sharp RGB Rotating Ring (Border only) */}
          <div className="absolute inset-0 rounded-full p-[2.5px] animate-[spin_4s_linear_infinite] bg-[conic-gradient(#00BFFF,#FF00FF,#FF4500,#FFD700,#00BFFF)] shadow-[0_0_25px_rgba(255,0,255,0.25)]" />

          {/* Solid Inner Mask to keep the inside clean and dark gray */}
          <div className="absolute inset-[3px] rounded-full bg-[#0A0A0A]/90 border border-white/10 flex items-center justify-center p-8 shadow-[0_25px_50px_rgba(0,0,0,0.9)] overflow-hidden">
            {/* Inner Core holding official logo perfectly centered */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <img
                src="https://i.ibb.co/WWwGbpL1/2.png"
                alt="MKA Studio Official Logo"
                className="w-48 md:w-56 h-auto object-contain select-none m-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Interactive Prompt / Sequence Loader Status */}
        <div className="mt-10 text-center min-h-[90px] flex flex-col items-center justify-center">
          <div
            ref={textPromptRef}
            onMouseEnter={() => studioAudio.playHover()}
            className="group flex flex-col items-center space-y-4"
          >
            <div className="inline-flex items-center space-x-3 px-8 py-3.5 bg-white text-black text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-[#D4D4D4] transition-all duration-300 shadow-xl">
              <span>Pulsar para comenzar</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-mono">
              Experiencia inmersiva &bull; Espacio 3D
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Editorial Telemetry */}
      <footer className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-white/40 tracking-[0.3em] uppercase z-20 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col gap-0.5">
            <span className="text-white/30 text-[8px]">Active Sequence</span>
            <span className="text-white/80">WEBP_SC_001.BIN</span>
          </div>
          <div className="w-[1px] h-6 bg-white/10" />
          <div className="flex flex-col gap-0.5">
            <span className="text-white/30 text-[8px]">Curator</span>
            <span className="text-white/80">MKA ARCHIVE</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-white/60">
          <span>GSAP SCROLLTRIGGER &amp; FLIP</span>
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
        </div>
      </footer>
    </div>
  );
};
