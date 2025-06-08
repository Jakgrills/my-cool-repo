'use client';

import { useEffect, useRef } from 'react';
import { BaristaGame, BaristaScene } from './game';

interface BaristaGameProps {
  width?: number;
  height?: number;
}

export default function BaristaGameComponent({ 
  width = 320, 
  height = 480 
}: BaristaGameProps) {
  const gameRef = useRef<BaristaGame | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width,
      height,
      parent: containerRef.current,
      scene: BaristaScene,
      pixelArt: true,
      backgroundColor: '#2e2e2e',
    };

    gameRef.current = new BaristaGame(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [width, height]);

  return (
    <div 
      ref={containerRef} 
      className="flex justify-center items-center"
      style={{ width, height }}
    />
  );
} 