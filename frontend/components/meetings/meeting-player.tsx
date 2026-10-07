"use client";

import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PlaybackRate } from "@/hooks/use-player";

type MeetingPlayerProps = {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: PlaybackRate;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: PlaybackRate) => void;
};

function formatTime(seconds: number): string {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const remainingSeconds = wholeSeconds % 60;

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
    : `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function MeetingPlayer({
  currentTime,
  duration,
  isPlaying,
  playbackRate,
  play,
  pause,
  seek,
  setPlaybackRate,
}: MeetingPlayerProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section
      aria-label="Simulated media player"
      className="overflow-hidden rounded-2xl bg-slate-950 p-5 text-white shadow-sm sm:p-7"
    >
      <div className="flex min-h-32 flex-col items-center justify-center">
        <Button
          aria-label={isPlaying ? "Pause simulated playback" : "Play simulated playback"}
          className="size-12 rounded-full bg-white text-slate-950 hover:bg-white/90"
          disabled={duration <= 0}
          onClick={isPlaying ? pause : play}
          size="icon-lg"
          type="button"
        >
          {isPlaying ? (
            <Pause aria-hidden="true" className="size-5 fill-current" />
          ) : (
            <Play aria-hidden="true" className="ml-0.5 size-5 fill-current" />
          )}
        </Button>
        <p className="mt-3 text-sm font-medium text-white/85">
          {isPlaying ? "Simulated playback" : "Meeting recording"}
        </p>
        <p className="mt-1 text-xs text-white/45">No audio is played</p>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span aria-label="Current time" className="min-w-11 text-right text-xs tabular-nums text-white/65">
          {formatTime(currentTime)}
        </span>
        <input
          aria-label="Seek meeting playback"
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          className="h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-violet-400 disabled:cursor-not-allowed"
          disabled={duration <= 0}
          max={duration || 0}
          min={0}
          onChange={(event) => seek(Number(event.target.value))}
          step="0.1"
          style={{
            background: `linear-gradient(to right, #a78bfa ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
          }}
          type="range"
          value={currentTime}
        />
        <span aria-label="Total duration" className="min-w-11 text-xs tabular-nums text-white/45">
          {formatTime(duration)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-xs text-white/45">Playback speed</span>
        <div aria-label="Playback speed" className="flex items-center gap-1">
          {([1, 1.5, 2] as const).map((rate) => (
            <button
              aria-pressed={playbackRate === rate}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                playbackRate === rate
                  ? "bg-violet-400/20 text-violet-200"
                  : "text-white/50 hover:bg-white/10 hover:text-white"
              }`}
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              type="button"
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
