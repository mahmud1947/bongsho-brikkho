"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Trash2, Send, Play, Pause, Lock, ChevronLeft } from "lucide-react";
import { Language } from "@/types/family";
import { vibrateDevice } from "@/lib/notificationUtils";

interface VoiceRecorderProps {
  lang: Language;
  onSendVoice: (audioUrl: string, durationSeconds: number) => Promise<void>;
  disabled?: boolean;
}

export default function VoiceRecorder({
  lang,
  onSendVoice,
  disabled = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      stopTracks();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const stopTracks = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  };

  const startLiveWaveform = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) return;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const render = () => {
        if (!analyserRef.current || !canvasRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = 3;
        const gap = 2;
        const barsCount = Math.floor(canvas.width / (barWidth + gap));

        for (let i = 0; i < barsCount; i++) {
          const val = dataArray[i % dataArray.length] || 0;
          const barHeight = Math.max(3, (val / 255) * canvas.height);
          const x = i * (barWidth + gap);
          const y = (canvas.height - barHeight) / 2;

          canvasCtx.fillStyle = "#10b981"; // Emerald green
          canvasCtx.beginPath();
          canvasCtx.roundRect(x, y, barWidth, barHeight, 2);
          canvasCtx.fill();
        }

        animationFrameRef.current = requestAnimationFrame(render);
      };

      render();
    } catch (e) {
      console.warn("Waveform visualization error:", e);
    }
  };

  const startRecording = async () => {
    if (disabled || isRecording || previewAudioUrl) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Select supported audio mimeType
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
          ? "audio/ogg;codecs=opus"
          : "";
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setIsLocked(false);
      setRecordDuration(0);
      setDragOffset({ x: 0, y: 0 });
      vibrateDevice([40]);

      // Start duration timer
      timerIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);

      // Start live visualizer
      startLiveWaveform(stream);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert(
        lang === "bn"
          ? "মাইক্রোফোন পারমিশন প্রয়োজন। ব্রাউজার সেটিংসে গিয়ে অনুমতি দিন।"
          : "Microphone permission required. Please enable it in browser settings."
      );
    }
  };

  const stopAndPreview = (shouldCancel = false) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      stopTracks();
      setIsRecording(false);
      setIsLocked(false);
      return;
    }

    recorder.onstop = () => {
      stopTracks();
      setIsRecording(false);
      setIsLocked(false);

      if (shouldCancel || recordDuration < 1) {
        audioChunksRef.current = [];
        setPreviewAudioUrl(null);
        return;
      }

      const audioBlob = new Blob(audioChunksRef.current, {
        type: recorder.mimeType || "audio/webm",
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        setPreviewAudioUrl(base64Url);
        vibrateDevice([30]);
      };
      reader.readAsDataURL(audioBlob);
    };

    recorder.stop();
  };

  const cancelRecording = () => {
    vibrateDevice([60]);
    stopAndPreview(true);
    setRecordDuration(0);
    setDragOffset({ x: 0, y: 0 });
    setPreviewAudioUrl(null);
  };

  // Preview Audio Playback Handlers
  const togglePreviewPlay = () => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    if (isPreviewPlaying) {
      audio.pause();
      setIsPreviewPlaying(false);
    } else {
      audio.play().then(() => setIsPreviewPlaying(true)).catch(() => {});
    }
  };

  const handleSendFinalVoice = async () => {
    if (!previewAudioUrl || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSendVoice(previewAudioUrl, recordDuration || 1);
      setPreviewAudioUrl(null);
      setRecordDuration(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Touch Handlers for Hold to Record & Slide to Cancel
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRecording || previewAudioUrl) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    startRecording();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isRecording || isLocked || !touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    setDragOffset({ x: dx, y: dy });

    // Slide up to lock
    if (dy < -45) {
      setIsLocked(true);
      vibrateDevice([25]);
    }

    // Slide left to cancel
    if (dx < -65) {
      cancelRecording();
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    if (isRecording && !isLocked) {
      stopAndPreview(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <>
      {/* 1. ACTIVE RECORDING OVERLAY BAR */}
      {isRecording && (
        <div className="absolute inset-x-0 bottom-0 top-0 bg-white z-30 flex items-center justify-between px-3.5 sm:px-4 py-2 border-t border-emerald-700/30 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Blinking recording indicator & duration */}
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
            <span className="font-mono text-xs sm:text-sm font-bold text-rose-600">
              {formatTime(recordDuration)}
            </span>

            {/* Live Canvas Waveform */}
            <canvas
              ref={canvasRef}
              width={90}
              height={24}
              className="hidden sm:block rounded-lg opacity-90"
            />

            {/* Gesture Tip */}
            {!isLocked && (
              <span className="text-[11px] text-stone-400 truncate flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5 animate-pulse" />
                {lang === "bn" ? "বাতিল করতে বাঁয়ে টানুন" : "Slide left to cancel"}
              </span>
            )}
          </div>

          {/* Action buttons during recording */}
          <div className="flex items-center gap-2">
            {/* Trash button */}
            <button
              type="button"
              onClick={cancelRecording}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer transition"
              title={lang === "bn" ? "বাতিল করুন" : "Cancel"}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* If locked, show Stop button */}
            {isLocked ? (
              <button
                type="button"
                onClick={() => stopAndPreview(false)}
                className="px-3 py-1.5 rounded-xl bg-emerald-900 text-amber-300 font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>{lang === "bn" ? "শেষ করুন" : "Stop"}</span>
              </button>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                <Lock className="w-3 h-3" />
                <span>{lang === "bn" ? "লক" : "Locked"}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 2. RECORDING PREVIEW BAR (Before sending) */}
      {previewAudioUrl && (
        <div className="absolute inset-x-0 bottom-0 top-0 bg-stone-50 z-30 flex items-center justify-between px-3.5 sm:px-4 py-2 border-t border-stone-200 animate-in fade-in duration-150">
          <audio
            ref={previewAudioRef}
            src={previewAudioUrl}
            onTimeUpdate={() => {
              if (previewAudioRef.current) {
                setPreviewCurrentTime(previewAudioRef.current.currentTime);
              }
            }}
            onEnded={() => {
              setIsPreviewPlaying(false);
              setPreviewCurrentTime(0);
            }}
          />

          <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-3">
            <button
              type="button"
              onClick={togglePreviewPlay}
              className="w-8 h-8 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center flex-shrink-0 cursor-pointer shadow-xs"
            >
              {isPreviewPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <span className="font-mono text-xs font-bold text-stone-700 block">
                {formatTime(previewCurrentTime || recordDuration)}
              </span>
              <span className="text-[10px] text-stone-400 block truncate">
                {lang === "bn" ? "ভয়েস মেসেজ প্রিভিউ" : "Voice message preview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPreviewAudioUrl(null);
                setRecordDuration(0);
              }}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer transition"
              title={lang === "bn" ? "মুছে ফেলুন" : "Discard"}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSendFinalVoice}
              className="w-9 h-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 flex items-center justify-center cursor-pointer shadow-xs font-bold disabled:opacity-50"
              title={lang === "bn" ? "পাঠান" : "Send voice"}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. NORMAL STATE MIC BUTTON */}
      {!isRecording && !previewAudioUrl && (
        <button
          type="button"
          disabled={disabled}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={startRecording}
          onMouseUp={() => isRecording && !isLocked && stopAndPreview(false)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition cursor-pointer bg-stone-100 hover:bg-emerald-50 text-emerald-800 border border-stone-200/80 active:scale-95 active:bg-emerald-100"
          title={
            lang === "bn"
              ? "চেপে ধরে ভয়েস রেকর্ড করুন"
              : "Hold to record voice message"
          }
        >
          <Mic className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
