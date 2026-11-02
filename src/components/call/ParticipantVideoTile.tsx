"use client";

import React, { useRef, useEffect } from "react";
import { Mic, MicOff, VideoOff } from "lucide-react";

interface ParticipantVideoTileProps {
  displayName: string;
  photoUrl?: string;
  stream?: MediaStream | null;
  isLocal?: boolean;
  isVideoOn?: boolean;
  isAudioOn?: boolean;
  isSpeaking?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function ParticipantVideoTile({
  displayName,
  photoUrl,
  stream,
  isLocal = false,
  isVideoOn = true,
  isAudioOn = true,
  isSpeaking = false,
  className = "",
  onClick,
}: ParticipantVideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  const hasVideoStream = isVideoOn && stream && stream.getVideoTracks().some((t) => t.enabled);

  return (
    <div
      onClick={onClick}
      className={`relative rounded-3xl overflow-hidden bg-neutral-900 border ${
        isSpeaking ? "border-emerald-400 ring-2 ring-emerald-500/50" : "border-stone-800"
      } shadow-2xl transition-all duration-200 select-none ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Local video must always be muted to prevent acoustic feedback loop
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          hasVideoStream ? "opacity-100" : "opacity-0 absolute pointer-events-none"
        } ${isLocal ? "scale-x-[-1]" : ""}`} // Mirror only local self view
      />

      {/* Avatar Fallback View (when video is turned off or connecting) */}
      {!hasVideoStream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 via-emerald-950/70 to-stone-900 p-4 text-center">
          <div className="relative mb-3">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-emerald-500/30 shadow-2xl"
              />
            ) : (
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-800 to-emerald-700 text-amber-300 font-black text-3xl sm:text-4xl flex items-center justify-center ring-4 ring-emerald-500/30 shadow-2xl">
                {displayName.charAt(0).toUpperCase() || "U"}
              </div>
            )}

            {/* Speaking Halo Animation */}
            {isSpeaking && (
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
            )}

            {/* Camera Off Indicator on Avatar */}
            <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-rose-600 text-white shadow-md">
              <VideoOff className="w-3.5 h-3.5" />
            </span>
          </div>

          <h4 className="font-extrabold text-sm sm:text-base text-white truncate max-w-[220px]">
            {displayName} {isLocal && <span className="text-emerald-400 text-xs font-normal">(You)</span>}
          </h4>
          <span className="text-[11px] text-stone-400 mt-0.5">
            {isVideoOn ? "Connecting camera..." : "Camera is off"}
          </span>
        </div>
      )}

      {/* Bottom Floating Info Pill */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/10 shadow-sm max-w-[75%] truncate">
          <span className="truncate">
            {displayName} {isLocal && "(You)"}
          </span>
        </div>

        {/* Mic Status Badge */}
        <div
          className={`p-1.5 rounded-xl backdrop-blur-md shadow-sm border ${
            isAudioOn
              ? isSpeaking
                ? "bg-emerald-500 text-white border-emerald-400 animate-pulse"
                : "bg-black/60 text-white border-white/10"
              : "bg-rose-600/90 text-white border-rose-500"
          }`}
          title={isAudioOn ? "Mic Active" : "Mic Muted"}
        >
          {isAudioOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
        </div>
      </div>
    </div>
  );
}
