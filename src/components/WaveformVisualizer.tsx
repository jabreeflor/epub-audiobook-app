'use client';

/**
 * WaveformVisualizer Component - DEV-16
 * Animated waveform visualization for audio playback
 */

import { useRef, useEffect, useState, useCallback } from 'react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  progress: number; // 0-100
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  barCount?: number;
  accentColor?: string;
}

export function WaveformVisualizer({
  isPlaying,
  progress,
  onClick,
  barCount = 50,
  accentColor = '#58a6ff',
}: WaveformVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bars, setBars] = useState<number[]>([]);
  const animationRef = useRef<number>();

  // Generate initial random bar heights
  useEffect(() => {
    const initialBars = Array.from({ length: barCount }, () => 
      0.3 + Math.random() * 0.7
    );
    setBars(initialBars);
  }, [barCount]);

  // Animate bars when playing
  const animate = useCallback(() => {
    if (!isPlaying) return;

    setBars(prevBars => 
      prevBars.map((height, index) => {
        // Create wave-like animation
        const time = Date.now() / 1000;
        const wave = Math.sin(time * 3 + index * 0.3) * 0.2;
        const randomFlicker = (Math.random() - 0.5) * 0.1;
        const newHeight = 0.4 + wave + randomFlicker;
        return Math.max(0.2, Math.min(1, newHeight));
      })
    );

    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Reset to static heights when paused
      setBars(prev => prev.map((h, i) => 0.3 + (Math.sin(i * 0.5) * 0.3 + 0.3)));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate]);

  const progressIndex = Math.floor((progress / 100) * barCount);

  return (
    <div 
      ref={containerRef}
      onClick={onClick}
      className="h-16 flex items-center gap-[2px] cursor-pointer select-none"
      role="slider"
      aria-label="Audio progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      {bars.map((height, index) => {
        const isPast = index < progressIndex;
        const isCurrent = index === progressIndex;
        
        return (
          <div
            key={index}
            className="flex-1 flex items-center justify-center"
            style={{ height: '100%' }}
          >
            <div
              className={`
                w-full rounded-full transition-all duration-75
                ${isPast || isCurrent ? '' : 'opacity-40'}
              `}
              style={{
                height: `${height * 100}%`,
                backgroundColor: isPast || isCurrent ? accentColor : 'rgba(255,255,255,0.3)',
                minHeight: '4px',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * MiniWaveform - Compact version for collapsed player
 */
export function MiniWaveform({ 
  isPlaying,
  barCount = 5,
}: { 
  isPlaying: boolean;
  barCount?: number;
}) {
  const [bars, setBars] = useState<number[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const initialBars = Array.from({ length: barCount }, () => 0.5);
    setBars(initialBars);
  }, [barCount]);

  const animate = useCallback(() => {
    if (!isPlaying) return;

    setBars(prevBars => 
      prevBars.map((_, index) => {
        const time = Date.now() / 1000;
        const wave = Math.sin(time * 4 + index * 0.8) * 0.4;
        return 0.3 + wave + 0.3;
      })
    );

    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setBars(prev => prev.map(() => 0.3));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate]);

  return (
    <div className="flex items-center gap-[2px] h-4">
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-1 bg-accent rounded-full transition-all duration-75"
          style={{ height: `${height * 100}%` }}
        />
      ))}
    </div>
  );
}

export default WaveformVisualizer;
