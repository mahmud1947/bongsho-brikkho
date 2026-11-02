"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Language } from "@/types/family";

interface VoiceMessagePlayerProps {
  audioUrl: string;
  duration?: number;
  isMine: boolean;
  lang: Language;
}

export default function VoiceMessagePlayer({
  audioUrl,
  duration = 0,
  isMine,
  lang,
}: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.playbackRate = playbackSpeed;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn("Audio playback failed:", e);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const seekTime = Number(e.target.value);
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [1, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-2.5 py-1 min-w-[210px] max-w-full">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 cursor-pointer shadow-xs ${
          isMine
            ? "bg-amber-400 text-emerald-950 hover:bg-amber-300"
            : "bg-emerald-800 text-amber-300 hover:bg-emerald-700"
        }`}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform / Scrubber & Time */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        {/* Scrubber slider */}
        <div className="relative flex items-center h-4 group">
          <input
            type="range"
            min={0}
            max={totalDuration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer transition ${
              isMine ? "accent-amber-400 bg-white/20" : "accent-emerald-700 bg-stone-200"
            }`}
          />
        </div>

        {/* Timestamps & Indicator */}
        <div
          className={`flex items-center justify-between text-[10px] font-mono leading-none ${
            isMine ? "text-emerald-100/90" : "text-stone-500"
          }`}
        >
          <span>{formatTime(currentTime)}</span>
          <span className="flex items-center gap-1 opacity-80">
            <Volume2 className="w-2.5 h-2.5" />
            <span>{formatTime(totalDuration)}</span>
          </span>
        </div>
      </div>

      {/* Speed Multiplier Button (1x, 1.5x, 2x) */}
      <button
        type="button"
        onClick={cycleSpeed}
        className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold flex-shrink-0 transition cursor-pointer border ${
          isMine
            ? "bg-white/15 border-white/25 text-amber-300 hover:bg-white/25"
            : "bg-stone-100 border-stone-300/80 text-stone-700 hover:bg-stone-200"
        }`}
        title={lang === "bn" ? "প্লেব্যাক গতি" : "Playback speed"}
      >
        {playbackSpeed}x
      </button>
    </div>
  );
}

