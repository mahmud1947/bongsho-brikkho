"use client";

import React from "react";
import {
  Bell,
  BellOff,
  BellRing,
  MessageCircle,
  Pin,
  Search,
  Video,
} from "lucide-react";
import Link from "next/link";
import { GroupSettings, Language, UserProfile } from "@/types/family";

interface ChatHeaderProps {
  groupSettings?: GroupSettings;
  messagesCount: number;
  onlineCount: number;
  pinnedCount: number;
  showPinnedOnly: boolean;
  notifPermission: string;
  isSearchOpen: boolean;
  currentUsername: string | null;
  currentUserProfile: UserProfile | null;
  currentDisplayName: string;
  lang: Language;
  onOpenGroupInfo: () => void;
  onOpenOnlineMembers: () => void;
  onStartGroupCall: () => void;
  onTogglePinnedFilter: () => void;
  onToggleNotification: () => void;
  onToggleSearch: () => void;
}

export default function ChatHeader({
  groupSettings,
  messagesCount,
  onlineCount,
  pinnedCount,
  showPinnedOnly,
  notifPermission,
  isSearchOpen,
  currentUsername,
  currentUserProfile,
  currentDisplayName,
  lang,
  onOpenGroupInfo,
  onOpenOnlineMembers,
  onStartGroupCall,
  onTogglePinnedFilter,
  onToggleNotification,
  onToggleSearch,
}: ChatHeaderProps) {
  const groupTitle =
    groupSettings?.groupNameEn && !/bongsho|বংশবৃক্ষ/i.test(groupSettings.groupNameEn)
      ? groupSettings.groupNameEn
      : groupSettings?.groupNameBn && !/bongsho|বংশবৃক্ষ/i.test(groupSettings.groupNameBn)
      ? groupSettings.groupNameBn
      : "Family Chat";

  return (
    <header className="px-3.5 sm:px-6 py-2.5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white flex items-center justify-between gap-2 border-b border-emerald-800/80 z-20 flex-shrink-0">
      {/* Group Logo & Name Clickable */}
      <div
        onClick={onOpenGroupInfo}
        className="flex items-center gap-2.5 sm:gap-3 min-w-0 cursor-pointer group/hdr hover:opacity-95 transition"
        title={lang === "bn" ? "গ্রুপের বিস্তারিত ও সেটিংস" : "View group info"}
      >
        <div className="relative flex-shrink-0">
          {groupSettings?.logoUrl ? (
            <img
              src={groupSettings.logoUrl}
              alt="Group Logo"
              className="w-10 h-10 rounded-2xl object-cover border border-amber-300 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center shadow-sm">
              <MessageCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm sm:text-base truncate group-hover/hdr:text-amber-300 transition">
              {groupTitle}
            </h2>

            {/* Online Counter Badge */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenOnlineMembers();
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800/90 hover:bg-emerald-700 text-amber-300 border border-emerald-700 cursor-pointer transition shadow-2xs"
              title={lang === "bn" ? "অনলাইন সদস্যদের তালিকা" : "Online members"}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{onlineCount || 1} {lang === "bn" ? "অনলাইন" : "Online"}</span>
            </button>
          </div>
          <p className="text-[11px] text-emerald-200/90 truncate">
            {lang === "bn"
              ? `${messagesCount}টি বার্তা • বিস্তারিত দেখতে ট্যাপ করুন`
              : `${messagesCount} messages • Tap for group info`}
          </p>
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Family Group Call Button */}
        <button
          type="button"
          onClick={onStartGroupCall}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-xs cursor-pointer transition border border-emerald-500/70"
          title={
            lang === "bn"
              ? "ফ্যামিলি গ্রুপ কল (অডিও ও ভিডিও)"
              : "Family Group Call (Audio & Video)"
          }
        >
          <Video className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">{lang === "bn" ? "গ্রুপ কল" : "Call"}</span>
        </button>

        {pinnedCount > 0 && (
          <button
            type="button"
            onClick={onTogglePinnedFilter}
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              showPinnedOnly
                ? "bg-amber-400 text-emerald-950 shadow-xs"
                : "bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 border border-emerald-700/70"
            }`}
            title={
              lang === "bn" ? "পিন করা বার্তা দেখুন" : "Filter pinned messages"
            }
          >
            <Pin className="w-3.5 h-3.5" />
            <span className="text-[11px]">{pinnedCount}</span>
          </button>
        )}

        {/* Notification Permission Toggle */}
        <button
          type="button"
          onClick={onToggleNotification}
          className={`p-2 rounded-xl transition cursor-pointer ${
            notifPermission === "granted"
              ? "bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 border border-emerald-700/70"
              : notifPermission === "denied"
              ? "bg-rose-900/40 text-rose-300 border border-rose-700/40"
              : "bg-amber-400 text-emerald-950 shadow-xs"
          }`}
          title={
            notifPermission === "granted"
              ? lang === "bn"
                ? "নোটিফিকেশন চালু আছে"
                : "Notifications active"
              : notifPermission === "denied"
              ? lang === "bn"
                ? "নোটিফিকেশন ব্লক করা আছে"
                : "Notifications blocked"
              : lang === "bn"
              ? "ফ্রি নোটিফিকেশন চালু করুন"
              : "Enable free notifications"
          }
        >
          {notifPermission === "granted" ? (
            <BellRing className="w-4 h-4" />
          ) : notifPermission === "denied" ? (
            <BellOff className="w-4 h-4" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={onToggleSearch}
          className={`p-2 rounded-xl transition cursor-pointer ${
            isSearchOpen
              ? "bg-amber-400 text-emerald-950"
              : "bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/70"
          }`}
          title={lang === "bn" ? "বার্তা খুঁজুন" : "Search messages"}
        >
          <Search className="w-4 h-4" />
        </button>

        {currentUsername && (
          <Link
            href="/profile"
            className="hidden sm:flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-xl bg-emerald-900/90 hover:bg-emerald-800 border border-emerald-700/70 text-xs text-emerald-100 transition"
            title={lang === "bn" ? "প্রোফাইল দেখুন" : "View Profile"}
          >
            {currentUserProfile?.photoUrl ? (
              <img
                src={currentUserProfile.photoUrl}
                alt={currentDisplayName || currentUsername}
                className="w-5 h-5 rounded-full object-cover border border-amber-300"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-amber-400 text-emerald-950 font-bold text-[10px] flex items-center justify-center">
                {(currentDisplayName || currentUsername).charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-xs truncate max-w-[80px]">
              {currentDisplayName || currentUsername}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
