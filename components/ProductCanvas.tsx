'use client';

import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { Product, PRODUCTS_DATA } from '@/lib/products';
import { studioAudio } from '@/lib/audio';
import { ProductHeroVisualizer } from '@/components/ProductHeroVisualizer';
import { ProductVesselDisplay } from '@/components/ProductVesselDisplay';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useQuoteStore } from '@/lib/useQuoteStore';
import { calculateTierUnitPrice, formatUSD } from '@/lib/quote-utils';
import {
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Zap,
  CheckCircle2,
  Maximize2,
  Eye,
} from 'lucide-react';

// Register GSAP plugins safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Flip);
}

export const ProductCanvas: React.FC = () => {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const detailPanelRef = useRef<HTMLDivElement>(null);
  const detailImageContainerRef = useRef<HTMLDivElement>(null);
  const detailContentRef = useRef<HTMLDivElement>(null);

  // References for each product's card and image element
  const productRefs = useRef<(HTMLElement | null)[]>([]);
  const imageRefs = useRef<{ [key: string]: HTMLImageElement | null }>({});

  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS_DATA);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeScrollIndex, setActiveScrollIndex] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'immersive' | 'specs'>('immersive');

  const addItem = useQuoteStore((state) => state.addItem);

  // Real-time Firestore synchronization for catalog additions from Admin Panel
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'products'),
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreProds = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Product[];

            // Merge with default PRODUCTS_DATA
            const combined = [...firestoreProds];
            PRODUCTS_DATA.forEach((def) => {
              if (!combined.some((p) => p.id === def.id || p.name === def.name)) {
                combined.push(def);
              }
            });
            setAllProducts(combined);
          }
        },
        (err) => {
          console.warn('Firestore products stream fallback:', err);
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Firestore init fallback to default data:', err);
    }
  }, []);

  // Filter products if desired
  const filteredProducts = allProducts.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.category.toLowerCase().includes(activeFilter.toLowerCase());
  });

  // Setup GSAP ScrollTrigger 3D Floating Physics
  useLayoutEffect(() => {
    // Scoped GSAP context cleanup
    const ctx = gsap.context(() => {
      // Refresh ScrollTrigger to calculate accurate layout positions
      ScrollTrigger.refresh();

      filteredProducts.forEach((product, idx) => {
        const cardEl = productRefs.current[idx];
        if (!cardEl) return;

        // Custom staggered lateral and rotational offset for simulated 3D space
        const isEven = idx % 2 === 0;
        const xOffset = isEven ? -25 : 25;
        const rotateY = isEven ? 6 : -6;
        const rotateZ = isEven ? -1.5 : 1.5;

        // 1. ScrollTrigger timeline: smooth float into center focus when scrolled into view
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: cardEl,
            start: 'top 85%',
            end: 'bottom 15%',
            scrub: 0.8,
            onUpdate: (self) => {
              // Highlight active item when it's closest to center
              if (self.progress > 0.35 && self.progress < 0.65) {
                setActiveScrollIndex(idx);
              }
            },
          },
        });

        // Enter smoothly -> Pin focus at center -> Depart gently
        scrollTl
          .fromTo(
            cardEl,
            {
              opacity: 0.35,
              scale: 0.88,
              y: 80,
              x: xOffset,
              rotateY: rotateY,
              rotateX: 8,
              rotateZ: rotateZ,
              filter: 'blur(2px) brightness(0.8)',
            },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              x: 0,
              rotateY: 0,
              rotateX: 0,
              rotateZ: 0,
              filter: 'blur(0px) brightness(1)',
              ease: 'power2.out',
              duration: 1,
            }
          )
          .to(cardEl, {
            opacity: 0.35,
            scale: 0.88,
            y: -80,
            x: -xOffset,
            rotateY: -rotateY,
            rotateX: -8,
            rotateZ: -rotateZ,
            filter: 'blur(2px) brightness(0.8)',
            ease: 'power2.in',
            duration: 1,
          });

        // 2. Idle gentle floating oscillation (zero-gravity breathing physics)
        const innerFloat = cardEl.querySelector('.floating-inner');
        if (innerFloat) {
          gsap.to(innerFloat, {
            y: '+=12',
            rotateZ: `+=${isEven ? 1.2 : -1.2}`,
            duration: 3.2 + (idx % 3) * 0.4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: idx * 0.2,
          });
        }
      });

      // Ambient background glow tracking scroll
      ScrollTrigger.create({
        trigger: scrollTrackRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const bgGlow = document.getElementById('ambient-scroll-glow');
          if (bgGlow) {
            gsap.to(bgGlow, {
              y: self.progress * 600,
              duration: 0.5,
              ease: 'power2.out',
            });
          }
        },
      });
    }, mainContainerRef);

    // Perform a delayed refresh to handle any layout shifts
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [filteredProducts, activeFilter]);

  // Handle Product Selection via GSAP FLIP & Smooth Unfolding Cascade
  const handleSelectProduct = (product: Product, index: number) => {
    studioAudio.playClick();
    studioAudio.playFlipOpen();
    setQuantity(1);

    const imgElement = imageRefs.current[product.id];
    if (!imgElement) {
      setSelectedProduct(product);
      return;
    }

    // Capture initial geometric state
    const flipState = Flip.getState(imgElement, {
      props: 'borderRadius,boxShadow,transform,filter',
    });

    // Update state to render detail overlay
    setSelectedProduct(product);

    // After DOM re-renders in next tick, execute continuous FLIP animation & orchestrated unfolding
    requestAnimationFrame(() => {
      const targetDetailImg = document.getElementById(`detail-image-${product.id}`);
      if (targetDetailImg) {
        Flip.from(flipState, {
          duration: 0.85,
          ease: 'power3.inOut',
          scale: true,
          absolute: true,
        });

        // Cascading smooth deployment of all product characteristics & specifications
        if (detailPanelRef.current) {
          const tl = gsap.timeline({ delay: 0.1 });

          // 1. Stage Vessel & Outer elements
          tl.fromTo(
            detailPanelRef.current.querySelectorAll('.detail-vessel-stage'),
            { opacity: 0, scale: 0.94, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.65, ease: 'power3.out' },
            0
          );

          // 2. Floating Spec Pills below Image
          tl.fromTo(
            detailPanelRef.current.querySelectorAll('.detail-spec-pill'),
            { opacity: 0, y: 18, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.07, duration: 0.55, ease: 'power2.out' },
            0.15
          );

          // 3. Staggered Smooth Unfolding of All Right-Side Characteristics
          tl.fromTo(
            detailPanelRef.current.querySelectorAll('.detail-reveal-item'),
            {
              opacity: 0,
              y: 28,
              scale: 0.98,
              filter: 'blur(2px)',
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              duration: 0.65,
              stagger: 0.05,
              ease: 'power3.out',
              clearProps: 'filter,scale',
            },
            0.12
          );
        }
      }
    });
  };

  // Handle Closing Detail View via GSAP FLIP back to canvas with smooth exit
  const handleCloseDetail = () => {
    if (!selectedProduct) return;
    studioAudio.playFlipClose();

    const currentProduct = selectedProduct;
    const detailImg = document.getElementById(`detail-image-${currentProduct.id}`);

    if (!detailImg || !detailPanelRef.current) {
      setSelectedProduct(null);
      return;
    }

    // Graceful smooth fold of detail elements before executing FLIP return
    gsap.to(
      detailPanelRef.current.querySelectorAll('.detail-reveal-item, .detail-spec-pill, .detail-vessel-stage'),
      {
        opacity: 0,
        y: 15,
        duration: 0.25,
        stagger: 0.015,
        ease: 'power2.in',
        onComplete: () => {
          // Capture state in detail view
          const flipState = Flip.getState(detailImg, {
            props: 'borderRadius,boxShadow,transform,filter',
          });

          // Reset selected product
          setSelectedProduct(null);

          // Re-render and FLIP back to floating card
          requestAnimationFrame(() => {
            const originalCanvasImg = imageRefs.current[currentProduct.id];
            if (originalCanvasImg) {
              Flip.from(flipState, {
                duration: 0.75,
                ease: 'power3.inOut',
                scale: true,
                absolute: true,
                onComplete: () => {
                  ScrollTrigger.refresh();
                },
              });
            }
          });
        },
      }
    );
  };

  // Scroll directly to a product
  const scrollToProduct = (index: number) => {
    studioAudio.playClick();
    const target = productRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div
      ref={mainContainerRef}
      id="product-canvas-root"
      className="relative z-10 w-full min-h-screen bg-transparent text-[#E5E5E5] selection:bg-white selection:text-black overflow-x-hidden font-sans"
    >
      {/* Outer Framing Border */}
      <div className="fixed inset-0 pointer-events-none border border-white/5 m-2 sm:m-4 md:m-6 z-40" />

      {/* Top Floating Studio HUD / Editorial Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[#0A0A0A]/85 border-b border-white/10 px-6 md:px-12 py-5 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col cursor-pointer select-none">
            <span className="text-xl font-bold tracking-[0.2em] uppercase text-white font-sans">
              MKA
            </span>
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-white/60 font-sans -mt-1">
              STUDIO
            </span>
          </div>
          <div className="hidden sm:block h-4 w-[1px] bg-white/20" />
          <span className="hidden sm:inline-block text-[9px] uppercase tracking-[0.35em] text-white/50 font-mono">
            CATALOGUE N. 042
          </span>
        </div>

        {/* Right HUD Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-[9px] font-mono uppercase tracking-[0.25em] text-white/40 border border-white/10 px-3.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>{filteredProducts.length} PIECES IN 3D SPACE</span>
          </div>
        </div>
      </nav>

      {/* Atmospheric Editorial Vignette & Subtle Radial Spotlight */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          id="ambient-scroll-glow"
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full product-mask blur-[100px] opacity-40 pointer-events-none"
        />
      </div>

      {/* Left Lateral Vertical Metadata Anchor (Responsive Scaling for Mobile & Desktop) */}
      <aside className="fixed left-2 md:left-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none select-none origin-left scale-[0.6] md:scale-100">
        <div className="vertical-text text-[9px] uppercase tracking-[0.5em] text-white/40 mb-6">
          Catalogue N.042 &bull; Series 01
        </div>
        <div className="w-[1px] h-24 bg-white/20" />
      </aside>

      {/* Sticky Right Telemetry / Quick Jump Timeline & Scroll Progress (Optimized for Mobile, Tablet & Desktop) */}
      <aside className="fixed right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center space-y-2 sm:space-y-3 pointer-events-auto select-none origin-right scale-[0.8] sm:scale-90 md:scale-100 bg-[#0A0A0A]/60 backdrop-blur-md p-1.5 sm:p-2 rounded-full border border-white/5 shadow-2xl">
        <div className="text-[7px] font-mono uppercase tracking-[0.25em] text-white/40 rotate-90 my-2">
          INDEX
        </div>

        {/* Timeline Dots */}
        <div className="flex flex-col items-center space-y-2.5 my-1">
          {filteredProducts.map((prod, idx) => {
            const isActive = idx === activeScrollIndex;
            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => scrollToProduct(idx)}
                onMouseEnter={() => studioAudio.playHover()}
                className="group relative flex items-center justify-center p-0.5 cursor-pointer"
                aria-label={`Saltar a ${prod.name}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-cyan-400 scale-150 shadow-[0_0_8px_rgba(6,182,212,0.9)]'
                      : 'border border-white/30 hover:border-white'
                  }`}
                />
                <span className="absolute right-7 px-3 py-1 bg-[#111] border border-white/15 text-[9px] font-mono tracking-widest text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl rounded">
                  {prod.code} &mdash; {prod.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Vertical Micro-Progress Bar */}
        <div className="w-[2px] h-8 sm:h-10 bg-white/10 rounded-full relative overflow-hidden my-1">
          <div
            className="w-full bg-cyan-400 rounded-full transition-all duration-300"
            style={{
              height: `${Math.max(8, (activeScrollIndex / Math.max(1, filteredProducts.length - 1)) * 100)}%`,
            }}
          />
        </div>

        {/* Telemetry Indicator Percentage & Piece Index */}
        <div className="flex flex-col items-center gap-0.5 text-center pt-0.5">
          <span className="text-[8px] font-mono font-bold text-cyan-400">
            {((activeScrollIndex / Math.max(1, filteredProducts.length - 1)) * 100).toFixed(0)}%
          </span>
          <span className="text-[7px] font-mono text-white/40 tracking-wider">
            0{activeScrollIndex + 1}/0{filteredProducts.length}
          </span>
        </div>
      </aside>

      {/* Hero Welcome Editorial Header (Split 3D Spatial Layout with Auto-Play Sweep Visualizer & TechTags) */}
      <header
        id="hero-sculpted-section"
        className="relative z-10 w-full min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-8 md:px-14 border-b border-white/5 overflow-hidden"
      >
        {/* Subtle Ambient Studio Lighting */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-cyan-500/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-center gap-8 lg:gap-14 px-4 sm:px-8 md:px-16 lg:px-24">
          {/* LEFT/BOTTOM COLUMN: Product Auto-Play Visualizer with GSAP Sweep entrance & floating TechTags */}
          <div className="flex flex-col items-center justify-center relative min-h-[320px] sm:min-h-[420px] md:min-h-[480px] lg:min-h-[540px] w-full md:w-1/2 lg:w-3/5 bg-transparent">
            <ProductHeroVisualizer
              triggerSelector="#hero-sculpted-section"
              videoSrc="/assets/Colorful_design_wrapping_plastic_1080p_202608282351.webm"
            />

            {/* Mobile-Only Interactive Scroll Prompt Indicator (Placed directly below the video) */}
            <div className="flex md:hidden items-center gap-3.5 text-white/60 justify-center mt-6 pt-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 animate-bounce shrink-0">
                <ChevronDown className="w-4 h-4 text-white/70" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/90 font-medium">
                  Desplaza hacia abajo
                </span>
                <span className="text-[10px] text-white/50">
                  Descubre las piezas del catálogo exclusivo
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT/TOP COLUMN: Editorial Typography & Product Introduction */}
          <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left w-full md:w-1/2 lg:w-2/5 pl-0 md:pl-4 lg:pl-8">
            <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
              <div className="h-[1px] w-8 bg-white/40" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/70 font-mono">
                MKA Studio &bull; Series 01
              </span>
            </div>

            <h1 className="font-sans font-bold text-4xl md:text-6xl tracking-tight text-white leading-[1.08] mb-6 text-center md:text-left">
              Sculpted by Silence
            </h1>

            <p className="text-sm sm:text-base text-white/70 leading-relaxed font-light mb-8 max-w-lg text-center md:text-left">
              Termos de acero inoxidable de doble pared, cerámica sinterizada y piezas acústicas de alta precisión. Explora el catálogo interactivo y cotiza tu lote personalizado en tiempo real.
            </p>

            {/* Technical Highlights Badges */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-8 md:mb-10 max-w-md w-full">
              <div className="p-3 bg-slate-900/60 backdrop-blur-md border border-slate-700/80 rounded-xl text-center md:text-left">
                <span className="text-[9px] font-mono uppercase text-cyan-400 block mb-0.5">Material</span>
                <span className="text-xs font-semibold text-white">Acero 18/8</span>
              </div>
              <div className="p-3 bg-slate-900/60 backdrop-blur-md border border-slate-700/80 rounded-xl text-center md:text-left">
                <span className="text-[9px] font-mono uppercase text-cyan-400 block mb-0.5">Capacidad</span>
                <span className="text-xs font-semibold text-white">600 ML</span>
              </div>
              <div className="p-3 bg-slate-900/60 backdrop-blur-md border border-slate-700/80 rounded-xl text-center md:text-left">
                <span className="text-[9px] font-mono uppercase text-cyan-400 block mb-0.5">Aislamiento</span>
                <span className="text-xs font-semibold text-white">Vacío 24h</span>
              </div>
            </div>

            {/* Desktop-Only Interactive Scroll Prompt Indicator */}
            <div className="hidden md:flex items-center gap-4 text-white/50 justify-start">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 animate-bounce">
                <ChevronDown className="w-4 h-4 text-white/70" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/80">
                  Desplaza hacia abajo
                </span>
                <span className="text-[10px] text-white/40">
                  Descubre las piezas del catálogo exclusivo
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3D Vertical Spatial Stage (Non-Grid Container) */}
      <main
        ref={scrollTrackRef}
        className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pb-40 pt-6"
        style={{ perspective: '1200px' }}
      >
        {filteredProducts.map((product, index) => {
          const isEven = index % 2 === 0;

          return (
            <section
              key={product.id}
              ref={(el) => {
                productRefs.current[index] = el;
              }}
              className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center my-12 md:my-20"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Spatial Coordinates Label */}
              <div
                className={`absolute pointer-events-none hidden md:flex flex-col text-[9px] font-mono text-white/30 tracking-[0.25em] select-none ${
                  isEven ? 'left-6 -top-8' : 'right-6 -top-8'
                }`}
              >
                <span>SYS_REF: {product.code}</span>
                <span>DEPTH_Z: -{(index * 35 + 20).toFixed(0)}MM</span>
              </div>

              {/* Floating Product Interactive Anchor */}
              <div
                onClick={() => handleSelectProduct(product, index)}
                onMouseEnter={() => studioAudio.playHover()}
                className="floating-inner group relative cursor-pointer flex flex-col items-center transition-all duration-300"
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Radial Backdrop Mask */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[420px] sm:h-[420px] product-mask rounded-full blur-2xl opacity-40 group-hover:opacity-75 transition-opacity duration-700 pointer-events-none" />

                {/* Main Vessel Container */}
                <div className="relative flex flex-col items-center justify-center">
                  {/* Floating Badge */}
                  <div className="mb-4 px-3 py-1 border border-white/15 bg-[#111111]/80 backdrop-blur-md text-[9px] uppercase tracking-[0.3em] text-white/70 flex items-center space-x-2 shadow-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>{product.badge}</span>
                  </div>

                  {/* Main Product Image Vessel Frame with Multi-Image Slideshow */}
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
                    <ProductVesselDisplay
                      product={product}
                      isDetail={false}
                      priority={index < 2}
                      enableAutoPlay={true}
                    />
                  </div>
                </div>

                {/* Floating Product Editorial Typography */}
                <div className="mt-6 text-center flex flex-col items-center">
                  <h3 className="font-sans font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight text-white group-hover:text-white/90 transition-colors leading-tight">
                    {product.name}
                  </h3>

                  <p className="text-[10px] uppercase tracking-[0.35em] mt-2 text-white/60 font-mono">
                    {product.category} &bull; Series 01
                  </p>

                  <div className="flex items-baseline gap-3 mt-3">
                    <span className="text-xl sm:text-2xl font-light text-white">
                      {product.price}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-mono">
                      USD
                    </span>
                  </div>

                  <span className="text-white/40 font-mono text-[9px] uppercase tracking-widest mt-2 group-hover:text-white/70 flex items-center space-x-1.5 transition-colors">
                    <span>Click to inspect &amp; quote</span>
                    <Eye className="w-3 h-3 text-white/70 inline" />
                  </span>
                </div>
              </div>
            </section>
          );
        })}
      </main>

      {/* Editorial Telemetry & Brand Footer (Visible at the end of scroll) */}
      <footer className="relative z-20 bg-[#0A0A0A] border-t border-white/10 px-4 sm:px-8 md:px-14 py-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-mono text-white/50 tracking-[0.2em] uppercase">
        <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 items-center justify-center md:justify-start">
          <div className="flex flex-col gap-0.5 text-center sm:text-left">
            <span className="text-[8px] text-white/30">Active Sequence</span>
            <span className="text-white/80">WEBP_SC_001.BIN</span>
          </div>

          <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

          {/* Copyright English */}
          <div className="flex items-center gap-1.5 text-white/60 tracking-wider">
            <span>&copy; MKA Studio &bull; All rights reserved</span>
          </div>

          <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

          {/* Subtle DevOps Credit (Clickable with direct WhatsApp redirection) */}
          <button
            type="button"
            id="btn-direct-devops-whatsapp"
            onClick={() => {
              studioAudio.playClick();
              window.open('https://wa.me/message/QNV4WWFL4KU6D1', '_blank');
            }}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 text-white/70 hover:text-cyan-300 transition-all duration-200 cursor-pointer shadow-sm"
            title="Contactar a DevOps: ARDev Solutions por WhatsApp"
          >
            <span className="text-white/40 group-hover:text-cyan-400/70 text-[9px]">DevOps:</span>
            <span className="text-white/90 group-hover:text-cyan-300 font-medium">ARDev Solutions</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            <div className="w-1.5 h-1.5 rounded-full border border-white/30" />
            <div className="w-1.5 h-1.5 rounded-full border border-white/30" />
          </div>
          <span className="text-white/40 text-[9px]">
            MKA Spatial Exhibition &bull; Series 01
          </span>
        </div>
      </footer>

      {/* CONTINUOUS GSAP FLIP DETAIL SHOWCASE VIEW (EDITORIAL THEMED) */}
      {selectedProduct && (
        <div
          ref={detailPanelRef}
          id="product-detail-modal-stage"
          className="fixed inset-0 z-50 bg-[#0A0A0A]/98 backdrop-blur-2xl overflow-y-auto text-[#E5E5E5]"
          style={{
            backgroundImage: `radial-gradient(circle at 35% 45%, rgba(40,40,40,0.6) 0%, #0A0A0A 70%)`,
          }}
        >
          {/* Outer Detail Framing */}
          <div className="fixed inset-0 pointer-events-none border border-white/5 m-3 md:m-6 z-40" />

          {/* Sticky Top Bar inside Detail Overlay */}
          <header className="sticky top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10">
            <button
              type="button"
              id="btn-close-detail"
              onClick={handleCloseDetail}
              className="group flex items-center space-x-3 px-4 py-2 border border-white/20 bg-black/60 hover:bg-white/10 text-white transition-all shadow-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase">
                Return to Gallery
              </span>
            </button>

            <div className="flex items-center space-x-3 text-[10px] font-mono text-white/50 tracking-[0.2em] uppercase">
              <span className="hidden sm:inline">Expanded FLIP View</span>
              <span className="px-2.5 py-0.5 border border-white/20 text-white font-bold bg-white/5">
                {selectedProduct.code}
              </span>
            </div>
          </header>

          {/* Main Dual-Column Responsive Detail Stage */}
          <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12 px-5 sm:px-8 md:px-12 pt-6 lg:pt-10 pb-28">
            {/* Left Column: The Product Showcase Stage (FLIP Image Landing Target) */}
            <div
              ref={detailImageContainerRef}
              className="w-full lg:w-1/2 flex flex-col items-center justify-center relative lg:sticky lg:top-24"
            >
              {/* Radial Vignette Mask */}
              <div className="absolute w-72 h-72 lg:w-[480px] lg:h-[480px] rounded-full product-mask blur-3xl pointer-events-none opacity-60" />

              {/* Target Container for continuous GSAP FLIP with Multi-Image Slideshow & 3D WebM Mode */}
              <div className="detail-vessel-stage relative w-72 h-72 sm:w-96 sm:h-96 md:w-[460px] md:h-[460px] lg:w-[480px] lg:h-[480px]">
                <ProductVesselDisplay
                  product={selectedProduct}
                  isDetail={true}
                  priority={true}
                  enableAutoPlay={true}
                />
              </div>

              {/* Floating Specifications Pill below Image */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-[10px] font-mono text-white/50 tracking-wider">
                <span className="detail-spec-pill px-3.5 py-1 border border-white/10 bg-white/5">
                  DIM: {selectedProduct.dimensions}
                </span>
                <span className="detail-spec-pill px-3.5 py-1 border border-white/10 bg-white/5">
                  WEIGHT: {selectedProduct.weight}
                </span>
                <span className="detail-spec-pill px-3.5 py-1 border border-white/10 bg-white/5 text-white/80">
                  STATUS: {selectedProduct.inStock ? 'READY IN ARCHIVE' : 'BESPOKE COMMISSION'}
                </span>
              </div>
            </div>

            {/* Right Column: Comprehensive Technical Details & Editorial Cotizar */}
            <div
              ref={detailContentRef}
              className="w-full lg:w-1/2 flex flex-col justify-start max-w-xl"
            >
              {/* Hairline Divider */}
              <div className="detail-reveal-item h-[1px] w-12 bg-white/40 mb-5" />

              {/* Category & Code */}
              <div className="detail-reveal-item flex items-center space-x-3 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/60">
                  {selectedProduct.code} &bull; {selectedProduct.category}
                </span>
                <span className="px-2 py-0.5 border border-white/20 text-[9px] font-mono text-white/70">
                  {selectedProduct.badge}
                </span>
              </div>

              {/* Product Title */}
              <h2 className="detail-reveal-item font-sans font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight text-white leading-tight">
                {selectedProduct.name}
              </h2>

              {/* Tagline */}
              <p className="detail-reveal-item text-xs sm:text-sm text-white/70 mt-3 font-light leading-relaxed">
                {selectedProduct.tagline}
              </p>

              {/* Price & Lead time block */}
              <div className="detail-reveal-item my-6 p-5 border border-white/10 bg-white/[0.02] flex items-baseline justify-between rounded-lg">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40 block mb-1">
                    Reference Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-light text-white">
                      {selectedProduct.price}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
                      USD
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40 block mb-1">
                    Crafting Period
                  </span>
                  <div className="text-xs text-white/80 font-mono">
                    {selectedProduct.leadTime}
                  </div>
                </div>
              </div>

              {/* View Switcher: Architectural Vision vs Technical Specs */}
              <div className="detail-reveal-item flex items-center space-x-4 border-b border-white/10 pb-3 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('immersive');
                    studioAudio.playClick();
                  }}
                  className={`text-[10px] font-mono tracking-[0.25em] uppercase pb-1 transition-all ${
                    viewMode === 'immersive'
                      ? 'text-white font-bold border-b border-white'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  Architectural Vision
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('specs');
                    studioAudio.playClick();
                  }}
                  className={`text-[10px] font-mono tracking-[0.25em] uppercase pb-1 transition-all ${
                    viewMode === 'specs'
                      ? 'text-white font-bold border-b border-white'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  Technical dossier
                </button>
              </div>

              {viewMode === 'immersive' ? (
                <div className="space-y-5">
                  {/* Long Description */}
                  <p className="detail-reveal-item text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                    {selectedProduct.longDescription}
                  </p>

                  {/* Key Features */}
                  <div className="detail-reveal-item space-y-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40 block">
                      Engineering Highlights
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedProduct.features.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-start space-x-2.5 text-xs text-white/80 border border-white/10 p-3 bg-white/[0.01] rounded"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Technical Specs Table */
                <div className="detail-reveal-item space-y-2">
                  <div className="border border-white/10 divide-y divide-white/10 bg-white/[0.01] text-xs rounded overflow-hidden">
                    {selectedProduct.specs.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center justify-between p-3.5"
                      >
                        <span className="font-mono text-white/40 tracking-wider">{spec.label}</span>
                        <span className="font-medium text-white text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Volume Pricing Business Logic */}
              {selectedProduct && (() => {
                const tierInfo = calculateTierUnitPrice(selectedProduct.id, quantity, selectedProduct.priceRaw);
                return (
                  <div className="detail-reveal-item mt-6 p-5 sm:p-6 border border-white/15 bg-white/[0.02] rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">
                        Cantidad Requerida
                      </span>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            studioAudio.playClick();
                            setQuantity((q) => Math.max(1, q - 1));
                          }}
                          className="w-9 h-9 flex items-center justify-center border border-white/20 hover:border-white text-white font-mono text-sm bg-black/50 transition-colors"
                        >
                          -
                        </button>
                        <span className="font-mono text-base font-bold w-10 text-center text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            studioAudio.playClick();
                            setQuantity((q) => q + 1);
                          }}
                          className="w-9 h-9 flex items-center justify-center border border-white/20 hover:border-white text-white font-mono text-sm bg-black/50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Volume Discount Rules Feedback */}
                    {selectedProduct.id === 'tazas-tradicionales' && (
                      <div className="text-[10px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 p-2.5 border border-[#00F0FF]/30 rounded">
                        💡 Regla de Volumen MKA: $6 c/u (1-2 unds) &rarr; <strong className="text-white">$5 c/u</strong> (≥3 unds)
                      </div>
                    )}
                    {selectedProduct.id === 'termos-botella-600ml' && (
                      <div className="text-[10px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 p-2.5 border border-[#00F0FF]/30 rounded">
                        💡 Regla de Volumen MKA: $9 c/u (1-2 unds) &rarr; <strong className="text-white">$8 c/u</strong> (≥3 unds)
                      </div>
                    )}
                    {tierInfo.hasDiscount && (
                      <div className="text-[10px] font-mono text-emerald-400">
                        ✨ ¡Descuento por volumen aplicado (-{tierInfo.discountPercentage}%)! Precio unitario ajustado: <strong className="text-white">{formatUSD(tierInfo.unitPrice)}</strong>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        <span className="text-[9px] font-mono text-white/40 block">Subtotal Orden</span>
                        <span className="text-2xl font-bold text-white font-mono">
                          {formatUSD(quantity * tierInfo.unitPrice)}
                        </span>
                      </div>

                      <button
                        type="button"
                        id="btn-add-to-quote"
                        onClick={() => {
                          studioAudio.playClick();
                          addItem({
                            productId: selectedProduct.id,
                            name: selectedProduct.name,
                            category: selectedProduct.category,
                            basePrice: selectedProduct.priceRaw,
                            quantity: quantity,
                            autoOpenDrawer: true,
                          });
                        }}
                        className="py-3.5 px-6 sm:px-8 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-[11px] tracking-[0.2em] uppercase flex items-center space-x-2 transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] rounded-lg"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Añadir a Cotización</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* CTAs: Editorial Return */}
              <div className="detail-reveal-item mt-5 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleCloseDetail}
                  className="py-2.5 px-5 border border-white/20 hover:border-white/40 font-mono text-[10px] tracking-[0.25em] uppercase text-white/70 hover:text-white transition-colors"
                >
                  Volver al Catálogo 3D
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
