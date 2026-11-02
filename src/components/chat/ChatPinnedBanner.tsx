"use client";

import React from "react";
import { Pin, Search, X } from "lucide-react";
import { FamilyChatMessage, Language } from "@/types/family";

interface ChatPinnedBannerProps {
  isSearchOpen: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCloseSearch: () => void;
  latestPinned: FamilyChatMessage | null;
  showPinnedOnly: boolean;
  pinnedCount: number;
  isAdmin: boolean;
  currentUsername: string | null;
  lang: Language;
  onScrollToMessage: (id: string) => void;
  onTogglePin: (msg: FamilyChatMessage) => void;
  onShowAll: () => void;
  getDisplayAuthorName: (msg: FamilyChatMessage) => string;
}

export default function ChatPinnedBanner({
  isSearchOpen,
  searchQuery,
  onSearchChange,
  onCloseSearch,
  latestPinned,
  showPinnedOnly,
  pinnedCount,
  isAdmin,
  currentUsername,
  lang,
  onScrollToMessage,
  onTogglePin,
  onShowAll,
  getDisplayAuthorName,
}: ChatPinnedBannerProps) {
  return (
    <>
      {/* SEARCH BAR */}
      {isSearchOpen && (
        <div className="px-3.5 py-2 bg-emerald-900/95 border-b border-emerald-800 flex items-center gap-2 z-10">
          <Search className="w-4 h-4 text-emerald-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              lang === "bn"
                ? "বার্তার যেকোনো অংশ দিয়ে খুঁজুন..."
                : "Search in messages..."
            }
            className="flex-1 bg-transparent text-white placeholder-emerald-300/60 text-xs sm:text-sm focus:outline-none"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="p-1 text-emerald-300 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onCloseSearch}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PINNED MESSAGE BANNER */}
      {latestPinned && !showPinnedOnly && (
        <div className="px-3.5 py-2 bg-amber-50/95 border-b border-amber-200/80 flex items-center justify-between gap-2 text-xs z-10">
          <button
            type="button"
            onClick={() => onScrollToMessage(latestPinned.id)}
            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-400/30 text-amber-800 flex items-center justify-center flex-shrink-0">
              <Pin className="w-3.5 h-3.5 rotate-45" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[11px] text-amber-900">
                  {lang === "bn" ? "পিন করা বার্তা" : "Pinned Message"}
                </span>
                <span className="text-[10px] text-amber-700 font-medium truncate">
                  • {getDisplayAuthorName(latestPinned)}
                </span>
              </div>
              <p className="text-stone-700 truncate text-xs group-hover:text-emerald-950">
                {latestPinned.text || (latestPinned.audioUrl ? "🎤 Voice Note" : "📷 Photo")}
              </p>
            </div>
          </button>
          {(isAdmin || latestPinned.authorUsername === currentUsername) && (
            <button
              type="button"
              onClick={() => onTogglePin(latestPinned)}
              className="p-1 rounded-lg hover:bg-amber-200/60 text-amber-800 cursor-pointer"
              title={lang === "bn" ? "আনপিন করুন" : "Unpin"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* FILTER ACTIVE BANNER */}
      {showPinnedOnly && (
        <div className="px-4 py-2 bg-amber-100/90 border-b border-amber-200 flex items-center justify-between text-xs text-amber-950 font-semibold">
          <span className="flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5" />
            {lang === "bn"
              ? `শুধুমাত্র পিন করা বার্তা দেখানো হচ্ছে (${pinnedCount})`
              : `Showing pinned messages only (${pinnedCount})`}
          </span>
          <button
            type="button"
            onClick={onShowAll}
            className="text-emerald-900 underline font-bold cursor-pointer"
          >
            {lang === "bn" ? "সব দেখুন" : "Show all"}
          </button>
        </div>
      )}
    </>
  );
}

