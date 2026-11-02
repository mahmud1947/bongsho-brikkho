"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Video, Mic, ExternalLink, Users, PhoneOff, Maximize2 } from "lucide-react";
import { Language } from "@/types/family";

interface FamilyGroupCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName?: string;
  userName: string;
  userPhoto?: string;
  lang: Language;
}

export default function FamilyGroupCallModal({
  isOpen,
  onClose,
  roomName = "Bongsho_Family_Group_Call",
  userName,
  userPhoto,
  lang,
}: FamilyGroupCallModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  const cleanRoom = roomName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const directMeetUrl = `https://meet.jit.si/${cleanRoom}#config.prejoinPageEnabled=false&config.disableDeepLinking=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName="${encodeURIComponent(
    userName || "Family Member"
  )}"`;

  useEffect(() => {
    if (!isOpen) {
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (e) {}
        jitsiApiRef.current = null;
      }
      setIsLoading(true);
      return;
    }

    let isCancelled = false;

    // Load Jitsi Meet External API Script
    const loadJitsiScript = () => {
      if ((window as any).JitsiMeetExternalAPI) {
        initializeJitsi();
        return;
      }

      const existingScript = document.getElementById("jitsi-external-api");
      if (existingScript) {
        existingScript.addEventListener("load", initializeJitsi);
        return;
      }

      const script = document.createElement("script");
      script.id = "jitsi-external-api";
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => {
        if (!isCancelled) initializeJitsi();
      };
      script.onerror = () => {
        console.warn("Could not load Jitsi script, falling back to direct iframe.");
        if (!isCancelled) setUseIframeFallback(true);
      };
      document.body.appendChild(script);
    };

    const initializeJitsi = () => {
      if (isCancelled || !jitsiContainerRef.current) return;
      if (!(window as any).JitsiMeetExternalAPI) {
        setUseIframeFallback(true);
        return;
      }

      try {
        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
          jitsiApiRef.current = null;
        }

        const domain = "meet.jit.si";
        const options = {
          roomName: cleanRoom,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: userName || "Family Member",
            avatarURL: userPhoto,
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableWelcomePage: false,
            enableClosePage: false,
            toolbarButtons: [
              "microphone",
              "camera",
              "hangup",
              "chat",
              "raisehand",
              "tileview",
              "fullscreen",
              "select-background",
            ],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_REMOTE_DISPLAY_NAME: "Family Member",
            MOBILE_APP_PROMO: false,
          },
        };

        const api = new (window as any).JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        api.addEventListeners({
          videoConferenceJoined: () => {
            if (!isCancelled) setIsLoading(false);
          },
          videoConferenceLeft: () => {
            onClose();
          },
          readyToClose: () => {
            onClose();
          },
        });

        // Hide spinner after 4 seconds as fallback
        setTimeout(() => {
          if (!isCancelled) setIsLoading(false);
        }, 4000);
      } catch (err) {
        console.error("Jitsi init error:", err);
        setUseIframeFallback(true);
      }
    };

    loadJitsiScript();

    return () => {
      isCancelled = true;
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (e) {}
        jitsiApiRef.current = null;
      }
    };
  }, [isOpen, cleanRoom, userName, userPhoto, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* HEADER */}
      <header className="h-14 bg-emerald-950 px-3 sm:px-6 flex items-center justify-between border-b border-emerald-800 text-white flex-shrink-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Video className="w-4 h-4 stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                {lang === "bn" ? "ফ্যামিলি গ্রুপ মিটিং রুম" : "Family Group Call Room"}
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800 text-emerald-200 border border-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{lang === "bn" ? "লাইভ" : "Live"}</span>
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 truncate">
              {lang === "bn"
                ? "একসাথে অডিও ও ভিডিও কলে কথা বলুন"
                : "Audio & Video Call together"}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Open full page in external browser tab if needed */}
          <a
            href={directMeetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
            title={lang === "bn" ? "পূর্ণ স্ক্রিনে খুলুন" : "Open full window"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {lang === "bn" ? "ফুল স্ক্রিন" : "Full View"}
            </span>
          </a>

          {/* End / Close Call Button */}
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition active:scale-95"
            title={lang === "bn" ? "কল কাটুন" : "Leave call"}
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>{lang === "bn" ? "লিভ নিন" : "Leave"}</span>
          </button>
        </div>
      </header>

      {/* CALL CONTAINER */}
      <div className="flex-1 w-full h-full relative bg-neutral-950 overflow-hidden">
        {/* Loading Spinner */}
        {isLoading && !useIframeFallback && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-neutral-950 text-white z-10">
            <div className="w-12 h-12 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mb-4" />
            <h4 className="font-bold text-sm sm:text-base mb-1">
              {lang === "bn"
                ? "ফ্যামিলি কল রুমে যুক্ত করা হচ্ছে..."
                : "Connecting to Family Call Room..."}
            </h4>
            <p className="text-xs text-stone-400 max-w-xs">
              {lang === "bn"
                ? "মাইক্রোফোন ও ক্যামেরার অনুমতি চাওয়া হলে 'Allow' চাপুন।"
                : "Please allow microphone and camera access if prompted."}
            </p>
          </div>
        )}

        {/* Jitsi API Mount Node */}
        {!useIframeFallback ? (
          <div ref={jitsiContainerRef} className="w-full h-full" />
        ) : (
          /* Direct iFrame Fallback */
          <iframe
            src={directMeetUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>
    </div>
  );
}

