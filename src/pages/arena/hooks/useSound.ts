import { useState, useEffect, useRef } from 'react';
import soundClick from '@/assets/click.mp3';

export function useSound(isMuted: boolean = false) {
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    clickAudioRef.current = new Audio(soundClick);
    clickAudioRef.current.volume = 0.5;
  }, []);

  const playSound = (sound: 'click') => {
    if (isMuted) return;
    if (sound === 'click' && clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(() => {});
    }
  };

  return { playSound };
}
