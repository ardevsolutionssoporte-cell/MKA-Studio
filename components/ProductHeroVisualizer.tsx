'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface TechTagProps {
  id?: string;
  label: string;
  value: string;
  positionClass: string;
  align?: 'left' | 'right';
  indicatorDot?: boolean;
  floatDistance?: number;
  floatDuration?: number;
  floatDelay?: number;
  className?: string;
}

export const TechTag: React.FC<TechTagProps> = ({
  id,
  label,
  value,
  positionClass,
  align = 'left',
  floatDistance = 5,
  floatDuration = 3,
  floatDelay = 0,
  className = '',
}) => {
  const tagRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!tagRef.current) return;

    const ctx = gsap.context(() => {
      // Floating yoyo animation on Y-axis
      gsap.to(tagRef.current, {
        y: `-=${floatDistance}`,
        duration: floatDuration,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: floatDelay,
      });
    }, tagRef);

    return () => ctx.revert();
  }, [floatDistance, floatDuration, floatDelay]);

  const isRight = align === 'right';

  return (
    <div
      ref={tagRef}
      id={id}
      className={`absolute z-30 pointer-events-auto select-none ${positionClass} ${className}`}
    >
      {/* Contenedor flex adaptativo con punto, línea y badge HUD */}
      <div
        className={`flex items-center gap-1 sm:gap-1.5 md:gap-2 group transition-all duration-300 ${
          isRight ? 'flex-row text-left' : 'flex-row-reverse text-right'
        }`}
      >
        {/* Punto técnico con resplandor cian */}
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse flex-shrink-0" />

        {/* Línea conectora adaptativa (no invade el producto) */}
        <div className="w-2 sm:w-3.5 md:w-6 lg:w-8 h-[1px] bg-cyan-500/50 group-hover:bg-cyan-300 transition-all duration-300 flex-shrink-0" />

        {/* Badge HUD con fondo sutil oscuro para máxima legibilidad y adaptación responsive */}
        <div
          className={`flex flex-col px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-black/80 sm:bg-black/60 backdrop-blur-md border border-cyan-500/25 shadow-[0_2px_12px_rgba(0,0,0,0.85)] max-w-[85px] xs:max-w-[100px] sm:max-w-[125px] md:max-w-[160px] ${
            isRight ? 'items-start text-left' : 'items-end text-right'
          }`}
        >
          <span className="text-[6px] xs:text-[6.5px] sm:text-[7.5px] md:text-[8.5px] text-cyan-400 uppercase tracking-[0.14em] font-mono leading-none mb-0.5 truncate w-full">
            {label}
          </span>
          <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11.5px] text-white/95 font-medium leading-tight line-clamp-2">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
};

export interface ProductHeroVisualizerProps {
  videoSrc?: string;
  triggerSelector?: string;
  className?: string;
}

export const ProductHeroVisualizer: React.FC<ProductHeroVisualizerProps> = ({
  videoSrc = '/assets/Colorful_design_wrapping_plastic_1080p_202608282351.webm',
  triggerSelector = '#hero-sculpted-section',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const scanlineRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Ultra-smooth Hardware Accelerated GPU WebGL Renderer (Zero CPU overhead, 60-120 FPS)
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animationFrameId: number;
    let isCleanedUp = false;

    // Initialize WebGL context with transparent background support
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
      // Fallback to simple Canvas 2D without per-pixel CPU blocking
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

    // Vertex Shader: Maps a full screen quad
    const vsSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    // Fragment Shader: Ultra-fast GPU Chroma/Luma Extraction with Smooth Feathering
    const fsSource = `
      precision mediump float;
      uniform sampler2D u_texture;
      varying vec2 v_texCoord;
      void main() {
        vec4 color = texture2D(u_texture, v_texCoord);
        float maxVal = max(color.r, max(color.g, color.b));
        
        // Thresholds calibrated for clean elimination of dark compression artifacts
        float minThresh = 0.086; // ~22/255
        float maxThresh = 0.235; // ~60/255
        
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

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    // Quad geometry covering [-1, 1]
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Texture coords (inverted Y for video orientation)
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
      ]),
      gl.STATIC_DRAW
    );

    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // GPU Texture
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

    const renderLoop = () => {
      if (isCleanedUp) return;

      if (video.readyState >= 2 && !video.paused && !video.ended) {
        const vWidth = video.videoWidth || defaultWidth;
        const vHeight = video.videoHeight || defaultHeight;

        if (canvas.width !== vWidth || canvas.height !== vHeight) {
          canvas.width = vWidth;
          canvas.height = vHeight;
          gl.viewport(0, 0, vWidth, vHeight);
        }

        // Direct hardware texture upload without CPU byte copies
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        if (!videoLoaded) setVideoLoaded(true);
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    video.play().catch(() => {});
    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      isCleanedUp = true;
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteTexture(texture);
        gl.deleteBuffer(positionBuffer);
        gl.deleteBuffer(texCoordBuffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      }
    };
  }, [videoLoaded]);

  // GSAP ScrollTrigger Entrance & Exit Smooth Animation
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          y: 80,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );

      // Sweep Scanline reveal effect on media wrapper (passes once smoothly and fades out)
      if (scanlineRef.current) {
        const sweepTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });

        sweepTl
          .fromTo(
            scanlineRef.current,
            { left: '-30%', opacity: 0 },
            {
              left: '40%',
              opacity: 0.7,
              duration: 0.7,
              ease: 'power2.in',
            }
          )
          .to(scanlineRef.current, {
            left: '120%',
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
          });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [triggerSelector]);

  return (
    <div
      ref={containerRef}
      id="product-hero-visualizer-root"
      className={`relative w-full max-w-[260px] sm:max-w-[310px] md:max-w-[360px] lg:max-w-[400px] aspect-[9/16] flex items-center justify-center bg-transparent mx-auto ${className}`}
    >
      {/* Floating Specs Tags (Percentage-based vertical anchoring for strict alignment with the vertical 9:16 silhouette) */}
      <TechTag
        id="tech-tag-material"
        label="MATERIAL"
        value="Acero Inoxidable"
        positionClass="top-[14%] left-[-16px] sm:left-[-32px] md:left-[-55px]"
        align="left"
        floatDistance={7}
        floatDuration={3.2}
        floatDelay={0}
      />

      <TechTag
        id="tech-tag-capacidad"
        label="CAPACIDAD"
        value="600 ML"
        positionClass="top-[28%] right-[-16px] sm:right-[-32px] md:right-[-55px]"
        align="right"
        floatDistance={8}
        floatDuration={2.8}
        floatDelay={0.4}
      />

      <TechTag
        id="tech-tag-accesorio"
        label="ACCESORIO"
        value="Carabina Deportiva"
        positionClass="top-[62%] left-[-16px] sm:left-[-32px] md:left-[-55px]"
        align="left"
        floatDistance={6}
        floatDuration={3.5}
        floatDelay={0.8}
      />

      <TechTag
        id="tech-tag-aislamiento"
        label="AISLAMIENTO"
        value="Doble Pared al Vacío"
        positionClass="top-[80%] right-[-16px] sm:right-[-32px] md:right-[-55px]"
        align="right"
        floatDistance={7}
        floatDuration={3.0}
        floatDelay={1.1}
      />

      {/* Soft Cinematic Backlight behind the bottle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-60 md:w-72 h-72 sm:h-96 bg-cyan-500/[0.07] rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Central Media Container with 9:16 Aspect Ratio and overflow clipping */}
      <div
        ref={mediaRef}
        id="hero-media-wrapper"
        className="w-full h-full flex items-center justify-center select-none bg-transparent relative overflow-hidden rounded-2xl"
      >
        {/* Holographic sweep light beam that passes once and completely fades out */}
        <div
          ref={scanlineRef}
          className="absolute top-0 bottom-0 w-28 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent pointer-events-none z-20 -skew-x-12 opacity-0"
          style={{ left: '-30%' }}
        />

        {/* Hidden video source for hardware decoding */}
        <video
          ref={videoRef}
          src={videoSrc || "/assets/Colorful_design_wrapping_plastic_1080p_202608282351.webm"}
          autoPlay
          loop
          muted
          playsInline
          crossOrigin="anonymous"
          className="hidden"
        >
          <source src={videoSrc} type="video/webm" />
          <source src="/assets/Colorful_design_wrapping_plastic_1080p_202608282351.webm" type="video/webm" />
          <source src="/assets/thermo_vp9_transparent.webm" type="video/webm" />
        </video>

        {/* Real-time Transparent Canvas in strict 9:16 vertical aspect ratio */}
        <canvas
          ref={canvasRef}
          id="hero-product-canvas-renderer"
          className="w-full h-full aspect-[9/16] object-contain pointer-events-none relative z-10"
        />
      </div>
    </div>
  );
};

