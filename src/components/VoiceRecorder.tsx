"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Trash2, Send, Play, Pause, Square, AlertCircle } from "lucide-react";
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
  const [recordDuration, setRecordDuration] = useState(0);
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
  const recordDurationRef = useRef<number>(0);

  // Keep duration ref in sync for callbacks
  useEffect(() => {
    recordDurationRef.current = recordDuration;
  }, [recordDuration]);

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      stopTracks();
      cleanupTimerAndVisualizer();
    };
  }, []);

  const stopTracks = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  };

  const cleanupTimerAndVisualizer = () => {
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
      audioContextRef.current = null;
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

          canvasCtx.fillStyle = "#10b981";
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
    if (disabled || isRecording || previewAudioUrl || isSubmitting) return;

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
      setRecordDuration(0);
      recordDurationRef.current = 0;
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
          ? "মাইক্রোফোন পারমিশন প্রয়োজন। ব্রাউজার বা ফোন সেটিংসে গিয়ে পারমিশন দিন।"
          : "Microphone permission is required. Please grant permission in browser settings."
      );
    }
  };

  // Stop recording and show preview
  const handleStopAndPreview = () => {
    cleanupTimerAndVisualizer();
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      stopTracks();
      setIsRecording(false);
      return;
    }

    recorder.onstop = () => {
      stopTracks();
      setIsRecording(false);

      if (audioChunksRef.current.length === 0) {
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

  // Direct send while recording
  const handleStopAndSend = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    cleanupTimerAndVisualizer();

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      stopTracks();
      setIsRecording(false);
      setIsSubmitting(false);
      return;
    }

    recorder.onstop = () => {
      stopTracks();
      setIsRecording(false);

      if (audioChunksRef.current.length === 0) {
        setIsSubmitting(false);
        return;
      }

      const audioBlob = new Blob(audioChunksRef.current, {
        type: recorder.mimeType || "audio/webm",
      });

      const finalDuration = Math.max(1, recordDurationRef.current);

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Url = reader.result as string;
          await onSendVoice(base64Url, finalDuration);
          vibrateDevice([40]);
        } catch (err) {
          console.error("Voice send error:", err);
        } finally {
          setIsSubmitting(false);
          setRecordDuration(0);
          audioChunksRef.current = [];
        }
      };
      reader.readAsDataURL(audioBlob);
    };

    recorder.stop();
  };

  // Cancel and discard recording
  const handleCancelRecording = () => {
    cleanupTimerAndVisualizer();
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        stopTracks();
        audioChunksRef.current = [];
        setIsRecording(false);
        setPreviewAudioUrl(null);
        setRecordDuration(0);
      };
      recorder.stop();
    } else {
      stopTracks();
      audioChunksRef.current = [];
      setIsRecording(false);
      setPreviewAudioUrl(null);
      setRecordDuration(0);
    }
    vibrateDevice([50]);
  };

  // Preview Audio Playback Handlers
  const togglePreviewPlay = () => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    if (isPreviewPlaying) {
      audio.pause();
      setIsPreviewPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPreviewPlaying(true))
        .catch(() => {});
    }
  };

  // Send from preview mode
  const handleSendFromPreview = async () => {
    if (!previewAudioUrl || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSendVoice(previewAudioUrl, Math.max(1, recordDurationRef.current));
      setPreviewAudioUrl(null);
      setRecordDuration(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <>
      {/* 1. ACTIVE RECORDING OVERLAY BAR */}
      {isRecording && (
        <div className="absolute inset-x-0 bottom-0 top-0 bg-white z-40 flex items-center justify-between px-3 sm:px-4 py-2 border-t border-emerald-700/40 shadow-lg animate-in fade-in duration-150">
          {/* Recording Timer & Waveform */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse flex-shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-black text-rose-600">
              {formatTime(recordDuration)}
            </span>

            {/* Live Canvas Waveform */}
            <canvas
              ref={canvasRef}
              width={100}
              height={26}
              className="hidden sm:block rounded-lg opacity-90"
            />
          </div>

          {/* Action Buttons: Cancel, Stop, Send */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* 1. Cancel / Discard */}
            <button
              type="button"
              onClick={handleCancelRecording}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 active:scale-95 cursor-pointer transition flex items-center gap-1 text-xs font-bold"
              title={lang === "bn" ? "বাতিল করুন" : "Cancel"}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden xs:inline">{lang === "bn" ? "বাতিল" : "Cancel"}</span>
            </button>

            {/* 2. Stop & Preview */}
            <button
              type="button"
              onClick={handleStopAndPreview}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs border border-stone-300 cursor-pointer transition active:scale-95"
              title={lang === "bn" ? "রেকর্ড থামান ও শুনুন" : "Stop and preview"}
            >
              <Square className="w-3.5 h-3.5 fill-current text-rose-600" />
              <span>{lang === "bn" ? "থামুন" : "Stop"}</span>
            </button>

            {/* 3. Direct Send */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleStopAndSend}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition active:scale-95 disabled:opacity-50"
              title={lang === "bn" ? "সরাসরি পাঠান" : "Send now"}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "পাঠান" : "Send"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. RECORDING PREVIEW BAR (Before sending) */}
      {previewAudioUrl && (
        <div className="absolute inset-x-0 bottom-0 top-0 bg-stone-50 z-40 flex items-center justify-between px-3 sm:px-4 py-2 border-t border-stone-200 shadow-lg animate-in fade-in duration-150">
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

          <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
            <button
              type="button"
              onClick={togglePreviewPlay}
              className="w-8 h-8 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center flex-shrink-0 cursor-pointer shadow-xs active:scale-95"
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
              <span className="text-[10px] text-stone-500 block truncate">
                {lang === "bn" ? "ভয়েস মেসেজ প্রিভিউ" : "Voice message preview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setPreviewAudioUrl(null);
                setRecordDuration(0);
              }}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-100/70 cursor-pointer transition flex items-center gap-1 text-xs font-bold"
              title={lang === "bn" ? "মুছে ফেলুন" : "Discard"}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden xs:inline">{lang === "bn" ? "মুছুন" : "Discard"}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSendFromPreview}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition active:scale-95 disabled:opacity-50"
              title={lang === "bn" ? "পাঠান" : "Send voice"}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "পাঠান" : "Send"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. NORMAL STATE MIC BUTTON */}
      {!isRecording && !previewAudioUrl && (
        <button
          type="button"
          disabled={disabled || isSubmitting}
          onClick={startRecording}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition cursor-pointer bg-stone-100 hover:bg-emerald-50 text-emerald-800 border border-stone-200/80 active:scale-95 active:bg-emerald-100"
          title={
            lang === "bn"
              ? "ভয়েস মেসেজ রেকর্ড করুন"
              : "Record voice message"
          }
        >
          <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </>
  );
}
