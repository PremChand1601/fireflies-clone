"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PlaybackRate = 1 | 1.5 | 2;

export function usePlayer(durationSeconds: number) {
  const duration =
    Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 0;
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState<PlaybackRate>(1);
  const currentTimeRef = useRef(0);
  const playbackRateRef = useRef<PlaybackRate>(1);
  const lastTickRef = useRef(0);

  const seek = useCallback(
    (time: number) => {
      const nextTime = Number.isFinite(time) ? Math.min(duration, Math.max(0, time)) : 0;
      currentTimeRef.current = nextTime;
      setCurrentTime(nextTime);
      if (nextTime >= duration) {
        setIsPlaying(false);
      }
    },
    [duration],
  );

  const play = useCallback(() => {
    if (duration <= 0) {
      setIsPlaying(false);
      return;
    }
    if (currentTimeRef.current >= duration) {
      currentTimeRef.current = 0;
      setCurrentTime(0);
    }
    lastTickRef.current = performance.now();
    setIsPlaying(true);
  }, [duration]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const setPlaybackRate = useCallback((rate: PlaybackRate) => {
    playbackRateRef.current = rate;
    setPlaybackRateState(rate);
  }, []);

  useEffect(() => {
    if (!isPlaying || duration <= 0) return;

    lastTickRef.current = performance.now();
    const timerId = window.setInterval(() => {
      const now = performance.now();
      const elapsedSeconds = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      const nextTime = Math.min(
        duration,
        currentTimeRef.current + elapsedSeconds * playbackRateRef.current,
      );
      currentTimeRef.current = nextTime;
      setCurrentTime(nextTime);

      if (nextTime >= duration) {
        setIsPlaying(false);
      }
    }, 100);

    return () => window.clearInterval(timerId);
  }, [duration, isPlaying]);

  useEffect(() => {
    if (currentTimeRef.current > duration) {
      currentTimeRef.current = duration;
      setCurrentTime(duration);
    }
    if (duration <= 0) {
      currentTimeRef.current = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [duration]);

  return {
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    play,
    pause,
    seek,
    setPlaybackRate,
  };
}
