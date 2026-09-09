'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Product, ProductTag } from '@/lib/products';
import { TechTag } from '@/components/ProductHeroVisualizer';
import { ChevronLeft, ChevronRight, Video, Images, Sparkles, Layers } from 'lucide-react';
import { studioAudio } from '@/lib/audio';
import gsap from 'gsap';

interface ProductVesselDisplayProps {
  product: Product;
  isDetail?: boolean;
  onImageClick?: () => void;
  priority?: boolean;
  className?: string;
  enableAutoPlay?: boolean;
}

export const ProductVesselDisplay: React.FC<ProductVesselDisplayProps> = ({
  product,
  isDetail = false,
  onImageClick,
  priority = false,
  className = '',
  enableAutoPlay = true,
}) => {
  const allImages = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMode, setActiveMode] = useState<'slideshow' | 'video'>('slideshow');
  const [isPaused, setIsPaused] = useState(false);
  const [timerKey, setTimerKey] = useState(0); // Used to reset the auto-advance countdown cleanly
  const containerRef = useRef<HTMLDivElement>(null);
  const slideWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-advance slideshow diapositivas smoothly if no manual click is happening
  useEffect(() => {
    if (!enableAutoPlay || allImages.length <= 1 || isPaused || activeMode === 'video') return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    }, 3800);

    return () => clearInterval(interval);
  }, [allImages.length, enableAutoPlay, isPaused, activeMode, timerKey]);

  // Smooth slide entry transition animation
  useEffect(() => {
    if (!slideWrapperRef.current) return;
    gsap.fromTo(
      slideWrapperRef.current,
      { opacity: 0.75, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }
    );
  }, [currentIndex]);

  const handleManualPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    studioAudio.playClick();
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    setTimerKey((k) => k + 1); // Reset autoplay timer
  };

  const handleManualNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    studioAudio.playClick();
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
    setTimerKey((k) => k + 1); // Reset autoplay timer
  };

  const handleSelectDot = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    studioAudio.playClick();
    setCurrentIndex(idx);
    setTimerKey((k) => k + 1); // Reset autoplay timer
  };

  // GPU WebGL alpha-keying loop for transparent WebM video playback
  useEffect(() => {
    if (activeMode !== 'video' || !product.videoUrl) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animationFrameId: number;
    let isCleanedUp = false;

    const gl = (canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      antialias: true,
    }) ||
      canvas.getContext('experimental-webgl', {
        alpha: true,
        premultipliedAlpha: false,
      })) as WebGLRenderingContext | null;

    if (!gl) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const fallbackLoop = () => {
          if (!isCleanedUp && video.readyState >= 2 && !video.paused) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
          animationFrameId = requestAnimationFrame(fallbackLoop);
        };
        video.play().catch(() => {});
        animationFrameId = requestAnimationFrame(fallbackLoop);
      }
      return () => {
        isCleanedUp = true;
        cancelAnimationFrame(animationFrameId);
      };
    }

    const vsSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform sampler2D u_texture;
      varying vec2 v_texCoord;
      void main() {
        vec4 color = texture2D(u_texture, v_texCoord);
        float maxVal = max(color.r, max(color.g, color.b));
        float minThresh = 0.086;
        float maxThresh = 0.235;
        if (maxVal <= minThresh) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        } else if (maxVal < maxThresh) {
          float alpha = smoothstep(minThresh, maxThresh, maxVal);
          gl_FragColor = vec4(color.rgb * alpha, alpha);
        } else {
          gl_FragColor = color;
        }
      }
    `;

    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0]),
      gl.STATIC_DRAW
    );

    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Enable transparent alpha blending on WebGL
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const defaultWidth = 720;
    const defaultHeight = 1280;
    canvas.width = defaultWidth;
    canvas.height = defaultHeight;
    gl.viewport(0, 0, defaultWidth, defaultHeight);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    const render = () => {
      if (isCleanedUp) return;
      if (video.readyState >= 2 && !video.paused) {
        const vWidth = video.videoWidth || defaultWidth;
        const vHeight = video.videoHeight || defaultHeight;

        // Maintain precise intrinsic 9:16 or native video resolution
        if (canvas.width !== vWidth || canvas.height !== vHeight) {
          canvas.width = vWidth;
          canvas.height = vHeight;
          gl.viewport(0, 0, vWidth, vHeight);
        }

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    video.play().catch(() => {});
    animationFrameId = requestAnimationFrame(render);

    return () => {
      isCleanedUp = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeMode, product.videoUrl]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`group/vessel relative w-full h-full rounded-2xl overflow-hidden bg-[#121212] border border-white/15 shadow-[0_35px_90px_rgba(0,0,0,0.95)] flex items-center justify-center select-none ${className}`}
    >
      {/* Editorial Corner Bracket Accents */}
      <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-white/40 pointer-events-none z-30" />
      <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-white/40 pointer-events-none z-30" />
      <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-white/40 pointer-events-none z-30" />
      <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-white/40 pointer-events-none z-30" />

      {/* Floating Mode Switcher (Slideshow / Video 3D) if product has video */}
      {product.videoUrl && (
        <div className="absolute top-3.5 right-4 z-40 flex items-center bg-black/70 backdrop-blur-md border border-white/20 rounded-full p-0.5 shadow-lg">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              studioAudio.playClick();
              setActiveMode('slideshow');
            }}
            title="Galería Diapositiva"
            className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider rounded-full flex items-center space-x-1 transition-all ${
              activeMode === 'slideshow'
                ? 'bg-white text-black font-bold shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Images className="w-3 h-3" />
            <span className="hidden sm:inline">Fotos</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              studioAudio.playClick();
              setActiveMode('video');
            }}
            title="Animación 3D WebM"
            className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider rounded-full flex items-center space-x-1 transition-all ${
              activeMode === 'video'
                ? 'bg-[#00F0FF] text-black font-bold shadow'
                : 'text-white/60 hover:text-[#00F0FF]'
            }`}
          >
            <Video className="w-3 h-3" />
            <span className="hidden sm:inline">3D WebM</span>
          </button>
        </div>
      )}

      {/* MODE 1: Diapositiva Multi-Image Slideshow */}
      {activeMode === 'slideshow' && (
        <div
          ref={slideWrapperRef}
          onClick={onImageClick}
          className="relative w-full h-full flex items-center justify-center cursor-pointer p-4"
        >
          <div className="relative w-full h-full rounded-xl overflow-hidden">
            <Image
              id={isDetail ? `detail-image-${product.id}` : `product-img-${product.id}`}
              src={allImages[currentIndex]}
              alt={`${product.name} - Diapositiva ${currentIndex + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              priority={priority}
              referrerPolicy="no-referrer"
              className="object-cover object-center transition-transform duration-700 group-hover/vessel:scale-105"
              style={{
                filter: `drop-shadow(0 25px 35px rgba(0,0,0,0.9))`,
              }}
            />
          </div>

          {/* Diapositiva Navigation Arrows (shown if >1 image) */}
          {allImages.length > 1 && (
            <>
              {/* Subtle Auto-Play Progression Indicator Line */}
              {enableAutoPlay && (
                <div className="absolute top-2 left-4 right-4 z-30 h-0.5 bg-white/10 rounded-full overflow-hidden pointer-events-none">
                  <div
                    key={`progress-${currentIndex}-${timerKey}`}
                    className="h-full bg-[#00F0FF]/80 rounded-full animate-[progress_3.8s_linear]"
                    style={{
                      animation: 'progress 3.8s linear forwards',
                    }}
                  />
                </div>
              )}

              {/* Manual Back Arrow (Siempre accesible y retrocede la diapositiva) */}
              <button
                type="button"
                onClick={handleManualPrev}
                aria-label="Diapositiva anterior"
                title="Retroceder imagen"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/70 hover:bg-[#00F0FF] hover:text-black text-white border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 backdrop-blur-md shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Manual Forward Arrow (Avanza la diapositiva inmediatamente) */}
              <button
                type="button"
                onClick={handleManualNext}
                aria-label="Siguiente diapositiva"
                title="Avanzar imagen"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/70 hover:bg-[#00F0FF] hover:text-black text-white border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 backdrop-blur-md shadow-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Diapositiva Indicator Micro-Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-1.5 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-white/15">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => handleSelectDot(idx, e)}
                    aria-label={`Ir a diapositiva ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-5 bg-[#00F0FF]'
                        : 'w-1.5 bg-white/30 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* MODE 2: Animated Transparent WebM Video & Interactive 3D Tags */}
      {activeMode === 'video' && product.videoUrl && (
        <div
          onClick={onImageClick}
          className="relative w-full h-full flex items-center justify-center cursor-pointer p-2 overflow-hidden"
        >
          {/* Hidden HTML5 Video for WebGL Texture Feed */}
          <video
            ref={videoRef}
            src={product.videoUrl}
            loop
            muted
            playsInline
            autoPlay
            crossOrigin="anonymous"
            className="hidden"
          />

          {/* WebGL Canvas for GPU Alpha Transparent Rendering in natural 9:16 slender proportions */}
          <div className="relative h-full w-full flex items-center justify-center pointer-events-none">
            <canvas
              ref={canvasRef}
              width={720}
              height={1280}
              className="h-full w-auto max-w-full max-h-full object-contain pointer-events-none relative z-10 drop-shadow-[0_25px_40px_rgba(0,0,0,0.9)]"
            />
          </div>

          {/* Holographic Interactive Blueprint Tech Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="absolute inset-0 pointer-events-none z-30">
              {product.tags.map((tag, tIdx) => (
                <TechTag
                  key={tag.id || `tag-${tIdx}`}
                  id={tag.id}
                  label={tag.label}
                  value={tag.value}
                  positionClass={tag.positionClass || 'top-[30%] left-1 sm:left-2'}
                  align={tag.align || (tIdx % 2 === 0 ? 'left' : 'right')}
                  floatDistance={4}
                  floatDuration={3 + tIdx * 0.4}
                  floatDelay={tIdx * 0.2}
                  className={isDetail ? 'scale-100' : 'scale-[0.82] sm:scale-95 md:scale-100'}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subtle Bottom Aspect Ratio Badge */}
      <div className="absolute bottom-2 left-3 z-20 pointer-events-none">
        <span className="text-[8px] font-mono text-white/30 tracking-widest uppercase">
          {activeMode === 'video' ? '3D WEBM LAYER' : `SLIDE ${currentIndex + 1}/${allImages.length}`}
        </span>
      </div>
    </div>
  );
};
