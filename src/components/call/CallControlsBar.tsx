"use client";

import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  SwitchCamera,
} from "lucide-react";
import { Language } from "@/types/family";

interface CallControlsBarProps {
  lang: Language;
  isAudioOn: boolean;
  isVideoOn: boolean;
  hasMultipleCameras?: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onFlipCamera: () => void;
  onEndCall: () => void;
}

export default function CallControlsBar({
  lang,
  isAudioOn,
  isVideoOn,
  hasMultipleCameras = true,
  onToggleAudio,
  onToggleVideo,
  onFlipCamera,
  onEndCall,
}: CallControlsBarProps) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 px-4 py-2.5 rounded-full bg-neutral-900/90 backdrop-blur-2xl border border-white/20 shadow-2xl transition-all">
      {/* 1. Mic Toggle */}
      <button
        type="button"
        onClick={onToggleAudio}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-lg active:scale-90 ${
          isAudioOn
            ? "bg-white/15 hover:bg-white/25 border border-white/20"
            : "bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-600/30"
        }`}
        title={
          isAudioOn
            ? lang === "bn"
              ? "মাইক বন্ধ করুন"
              : "Mute Mic"
            : lang === "bn"
            ? "মাইক চালু করুন"
            : "Unmute Mic"
        }
      >
        {isAudioOn ? <Mic className="w-5 h-5 sm:w-6 sm:h-6" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      {/* 2. Video Toggle */}
      <button
        type="button"
        onClick={onToggleVideo}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-lg active:scale-90 ${
          isVideoOn
            ? "bg-white/15 hover:bg-white/25 border border-white/20"
            : "bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-600/30"
        }`}
        title={
          isVideoOn
            ? lang === "bn"
              ? "ক্যামেরা বন্ধ করুন"
              : "Turn Off Camera"
            : lang === "bn"
            ? "ক্যামেরা চালু করুন"
            : "Turn On Camera"
        }
      >
        {isVideoOn ? <Video className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      {/* 3. Flip Camera (Mobile Front/Back switch) */}
      {isVideoOn && hasMultipleCameras && (
        <button
          type="button"
          onClick={onFlipCamera}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center border border-white/20 shadow-lg cursor-pointer transition-all active:scale-90"
          title={lang === "bn" ? "ক্যামেরা ঘুরান (সামনে/পেছনে)" : "Switch Camera"}
        >
          <SwitchCamera className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* 4. End Call Button */}
      <button
        type="button"
        onClick={onEndCall}
        className="h-12 sm:h-14 px-5 sm:px-6 rounded-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-rose-950/80 cursor-pointer transition-all active:scale-90 ml-1"
        title={lang === "bn" ? "কল কাটুন" : "End Call"}
      >
        <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
        <span>{lang === "bn" ? "কল কাটুন" : "End Call"}</span>
      </button>
    </div>
  );
}
