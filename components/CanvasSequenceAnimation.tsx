'use client';

import React from 'react';
import {
  ProductHeroVisualizer,
  TechTag,
  type TechTagProps,
  type ProductHeroVisualizerProps,
} from '@/components/ProductHeroVisualizer';

export { TechTag, type TechTagProps, type ProductHeroVisualizerProps };

export interface CanvasSequenceAnimationProps {
  totalFrames?: number;
  framePathPattern?: (index: number) => string;
  triggerSelector?: string;
  className?: string;
  animateEntrance?: boolean;
  pinSection?: boolean;
  pinDistance?: string;
  onFrameUpdate?: (frame: number, total: number, progress: number) => void;
}

/**
 * Refactored Visualizer: Replaced heavy canvas scroll-scrubbing sequence
 * with high-performance video autoplay asset, GSAP sweep clip-path reveal,
 * and floating glassmorphic TechTags.
 */
export const CanvasSequenceAnimation: React.FC<CanvasSequenceAnimationProps> = ({
  triggerSelector = '#hero-sculpted-section',
  className = '',
}) => {
  return (
    <ProductHeroVisualizer
      triggerSelector={triggerSelector}
      className={className}
    />
  );
};
