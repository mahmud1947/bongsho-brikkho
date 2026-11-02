"use client";

import React from "react";
import { Download, X } from "lucide-react";
import { Language } from "@/types/family";

interface ChatLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
  onDownload: (url: string, id: string) => void;
  lang: Language;
}

export default function ChatLightbox({
  imageUrl,
  onClose,
  onDownload,
  lang,
}: ChatLightboxProps) {
  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(imageUrl, `lightbox-${Date.now()}`);
          }}
          className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer transition flex items-center gap-1.5 text-xs font-bold"
          title={lang === "bn" ? "গ্যালারিতে ডাউনলোড করুন" : "Save photo"}
        >
          <Download className="w-4 h-4" />
          <span className="hidden xs:inline">
            {lang === "bn" ? "ডাউনলোড" : "Save"}
          </span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <img
        src={imageUrl}
        alt="Full view"
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
      />
    </div>
  );
}

