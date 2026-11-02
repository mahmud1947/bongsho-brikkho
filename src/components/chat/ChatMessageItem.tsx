"use client";

import React from "react";
import {
  Check,
  CornerUpLeft,
  Download,
  MoreHorizontal,
  Pin,
  Video,
  ZoomIn,
} from "lucide-react";
import { FamilyChatMessage, FamilyMember, Language, getCountryFlag } from "@/types/family";
import VoiceMessagePlayer from "@/components/VoiceMessagePlayer";
import {
  getAvatarPalette,
  getInitials,
  formatMessageTime,
} from "./chatUtils";

interface ChatMessageItemProps {
  message: FamilyChatMessage;
  isMine: boolean;
  isGroupedWithPrev: boolean;
  isGroupedWithNext: boolean;
  matchedMember?: FamilyMember;
  authorDisplayName: string;
  lang: Language;
  currentUsername: string | null;
  swipingMsgId: string | null;
  swipeOffset: number;
  highlightedId: string | null;
  copiedId: string | null;
  downloadingImageId: string | null;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onTouchCancel: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onOpenProfile: (username: string, authorDisplayName: string, photoUrl?: string) => void;
  onScrollToMessage: (id: string) => void;
  onLightboxImage: (url: string) => void;
  onDownloadImage: (url: string, id: string) => void;
  onOpenMenu: () => void;
  onToggleReaction: (emoji: string) => void;
  onOpenCallRoom: () => void;
}

export default function ChatMessageItem({
  message,
  isMine,
  isGroupedWithPrev,
  isGroupedWithNext,
  matchedMember,
  authorDisplayName,
  lang,
  currentUsername,
  swipingMsgId,
  swipeOffset,
  highlightedId,
  copiedId,
  downloadingImageId,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  onContextMenu,
  onOpenProfile,
  onScrollToMessage,
  onLightboxImage,
  onDownloadImage,
  onOpenMenu,
  onToggleReaction,
  onOpenCallRoom,
}: ChatMessageItemProps) {
  const isHighlighted = highlightedId === message.id;

  const countryFlag =
    message.authorCountry ||
    matchedMember?.countryBn ||
    matchedMember?.countryEn
      ? getCountryFlag(
          message.authorCountry ||
            matchedMember?.countryBn ||
            matchedMember?.countryEn
        )
      : null;

  const reactionEntries = Object.entries(message.reactions || {}).filter(
    ([, users]) => Array.isArray(users) && users.length > 0
  );

  const readCount = Object.keys(message.readBy || {}).filter(
    (u) => u !== message.authorUsername
  ).length;
  const deliveredCount = Object.keys(message.deliveredTo || {}).filter(
    (u) => u !== message.authorUsername
  ).length;
  const hasReadByOthers = readCount > 0 || message.status === "read";
  const hasDeliveredToOthers =
    deliveredCount > 0 || message.status === "delivered" || hasReadByOthers;

  const renderMessageContent = (messageText: string) => {
    const parts = messageText.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@") && part.length > 1) {
        const uname = part.slice(1).toLowerCase();
        return (
          <span
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile(uname, `@${uname}`);
            }}
            className={`font-bold px-1 py-0.5 rounded cursor-pointer transition ${
              isMine
                ? "bg-emerald-800/80 text-amber-300 hover:bg-emerald-700 underline"
                : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 underline"
            }`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div
      id={`chat-msg-${message.id}`}
      className={`flex items-end gap-2 transition-all duration-300 ${
        isMine ? "justify-end" : "justify-start"
      } ${isGroupedWithPrev ? "mt-0.5" : "mt-3"} ${
        isHighlighted ? "bg-amber-200/50 -mx-2 px-2 py-1 rounded-2xl" : ""
      }`}
    >
      {/* Left Clickable Avatar for Others */}
      {!isMine && (
        <div className="w-8 flex-shrink-0 flex flex-col items-center">
          {!isGroupedWithNext ? (
            <button
              type="button"
              onClick={() =>
                onOpenProfile(
                  message.authorUsername,
                  authorDisplayName,
                  message.authorPhotoUrl || matchedMember?.photoUrl
                )
              }
              className="cursor-pointer group/av focus:outline-none"
              title={lang === "bn" ? "প্রোফাইল দেখুন" : "View Profile"}
            >
              {message.authorPhotoUrl || matchedMember?.photoUrl ? (
                <img
                  src={message.authorPhotoUrl || matchedMember?.photoUrl}
                  alt={authorDisplayName}
                  className="w-8 h-8 rounded-2xl object-cover border border-stone-300 shadow-2xs group-hover/av:scale-105 transition"
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-extrabold shadow-2xs group-hover/av:scale-105 transition ${getAvatarPalette(
                    message.authorUsername
                  )}`}
                >
                  {getInitials(authorDisplayName)}
                </div>
              )}
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}

      {/* Message Content Column */}
      <div
        className={`group relative max-w-[82%] sm:max-w-[75%] flex flex-col ${
          isMine ? "items-end" : "items-start"
        }`}
      >
        {/* Clickable Sender Name Header */}
        {!isGroupedWithPrev && (
          <div
            className={`flex items-center gap-1.5 mb-1 px-1 text-[11px] ${
              isMine ? "text-stone-600" : "text-stone-600"
            }`}
          >
            <button
              type="button"
              onClick={() =>
                onOpenProfile(
                  message.authorUsername,
                  authorDisplayName,
                  message.authorPhotoUrl || matchedMember?.photoUrl
                )
              }
              className="font-bold text-stone-800 hover:text-emerald-800 hover:underline cursor-pointer text-left"
            >
              {isMine ? (lang === "bn" ? "আপনি" : "You") : authorDisplayName}
            </button>
            {!isMine && (
              <span
                onClick={() =>
                  onOpenProfile(
                    message.authorUsername,
                    authorDisplayName,
                    message.authorPhotoUrl || matchedMember?.photoUrl
                  )
                }
                className="text-[10px] text-stone-400 font-mono hover:underline cursor-pointer"
              >
                @{message.authorUsername}
              </span>
            )}
            {countryFlag && <span className="text-xs leading-none">{countryFlag}</span>}
            {message.isPinned && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                <Pin className="w-2.5 h-2.5 rotate-45" />
                {lang === "bn" ? "পিন" : "Pinned"}
              </span>
            )}
          </div>
        )}

        {/* Bubble + Action Trigger Wrapper */}
        <div
          className={`relative flex items-center gap-1.5 ${
            isMine ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {/* Swipe-to-reply indicator */}
          {swipingMsgId === message.id && (
            <div
              className="absolute -left-9 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-all duration-150 z-10"
              style={{
                opacity: Math.min(swipeOffset / 28, 1),
                transform: `scale(${Math.min(
                  0.6 + (swipeOffset / 40) * 0.4,
                  1.15
                )}) translateY(-50%)`,
              }}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-colors ${
                  swipeOffset >= 38
                    ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                    : "bg-stone-300 text-stone-700"
                }`}
              >
                <CornerUpLeft className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* MESSAGE BUBBLE */}
          <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchCancel}
            onContextMenu={onContextMenu}
            style={{
              transform:
                swipingMsgId === message.id ? `translateX(${swipeOffset}px)` : undefined,
              transition:
                swipingMsgId === message.id
                  ? "none"
                  : "transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)",
            }}
            className={`relative px-3.5 py-2.5 shadow-xs select-none touch-pan-y transition-colors ${
              isMine
                ? `bg-gradient-to-br from-emerald-900 to-emerald-950 text-white ${
                    isGroupedWithNext ? "rounded-2xl" : "rounded-2xl rounded-br-xs"
                  }`
                : `bg-white border border-stone-200/90 text-stone-800 ${
                    isGroupedWithNext ? "rounded-2xl" : "rounded-2xl rounded-bl-xs"
                  }`
            }`}
          >
            {/* Quoted Reply Preview */}
            {message.replyTo && (
              <button
                type="button"
                onClick={() => onScrollToMessage(message.replyTo!.id)}
                className={`w-full text-left mb-2 pl-2.5 pr-2 py-1.5 rounded-xl border-l-3 text-xs transition block cursor-pointer ${
                  isMine
                    ? "bg-emerald-950/60 border-amber-400 text-emerald-100 hover:bg-emerald-950/90"
                    : "bg-stone-100 border-emerald-700 text-stone-700 hover:bg-stone-200/70"
                }`}
              >
                <span
                  className={`font-bold text-[10px] block ${
                    isMine ? "text-amber-300" : "text-emerald-800"
                  }`}
                >
                  {message.replyTo.authorName}
                </span>
                <span className="line-clamp-2 opacity-90 text-[11px]">
                  {message.replyTo.text}
                </span>
              </button>
            )}

            {/* Voice Message Player */}
            {message.audioUrl && (
              <div className="my-1 w-full min-w-[210px] sm:min-w-[260px]">
                <VoiceMessagePlayer
                  audioUrl={message.audioUrl}
                  duration={message.audioDuration}
                  isMine={isMine}
                  lang={lang}
                />
              </div>
            )}

            {/* Attached Image with Download & Zoom */}
            {message.imageUrl && (
              <div className="mb-2 relative group/img overflow-hidden rounded-xl border border-black/10 bg-black/5">
                <img
                  src={message.imageUrl}
                  alt="Chat attachment"
                  onClick={() => onLightboxImage(message.imageUrl!)}
                  className="max-h-64 w-auto max-w-full object-cover rounded-xl cursor-pointer hover:opacity-95 transition"
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover/img:opacity-100 transition z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadImage(message.imageUrl!, message.id);
                    }}
                    disabled={downloadingImageId === message.id}
                    className="px-2 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white transition cursor-pointer shadow-md flex items-center gap-1 text-[11px] font-bold"
                    title={lang === "bn" ? "গ্যালারিতে ডাউনলোড করুন" : "Save photo"}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === "bn" ? "ডাউনলোড" : "Save"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onLightboxImage(message.imageUrl!)}
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white transition cursor-pointer shadow-md"
                    title={lang === "bn" ? "বড় করে দেখুন" : "Zoom"}
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Message Text with Mentions */}
            {message.text && (
              <p className="text-[13.5px] sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                {renderMessageContent(message.text)}
              </p>
            )}

            {/* Call Invitation Banner */}
            {message.text &&
              (message.text.includes("গ্রুপ কল") || message.text.includes("Group Call")) && (
                <div className="mt-2 pt-2 border-t border-black/15 flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-bold flex items-center gap-1.5 ${
                      isMine ? "text-emerald-300" : "text-emerald-700"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {lang === "bn" ? "লাইভ মিটিং রুম" : "Live Room"}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenCallRoom}
                    className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{lang === "bn" ? "কলে যোগ দিন" : "Join Call"}</span>
                  </button>
                </div>
              )}

            {/* Timestamp + WhatsApp Ticks */}
            <div
              className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] ${
                isMine ? "text-emerald-200/80" : "text-stone-400"
              }`}
            >
              {message.editedAt && (
                <span className="italic">
                  {lang === "bn" ? "(এডিটেড)" : "(edited)"}
                </span>
              )}
              <span>{formatMessageTime(message.createdAt, lang)}</span>
              {copiedId === message.id && (
                <span className="text-amber-300 font-bold flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5" />
                  {lang === "bn" ? "কপি" : "Copied"}
                </span>
              )}

              {/* WhatsApp Tick Marks for own messages */}
              {isMine && (
                <span
                  className="inline-flex items-center ml-0.5"
                  title={
                    hasReadByOthers
                      ? lang === "bn"
                        ? "পড়েছেন (Blue Ticks)"
                        : "Read"
                      : hasDeliveredToOthers
                      ? lang === "bn"
                        ? "ডেলিভার হয়েছে (Delivered)"
                        : "Delivered"
                      : lang === "bn"
                      ? "পাঠানো হয়েছে (Sent)"
                      : "Sent"
                  }
                >
                  {hasReadByOthers ? (
                    <span className="text-sky-400 font-black tracking-tighter text-[11px] leading-none">
                      ✓✓
                    </span>
                  ) : hasDeliveredToOthers ? (
                    <span className="text-emerald-300/80 font-black tracking-tighter text-[11px] leading-none">
                      ✓✓
                    </span>
                  ) : (
                    <span className="text-emerald-300/70 font-bold text-[11px] leading-none">
                      ✓
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Desktop hover options trigger */}
          <div className="hidden sm:inline-flex opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMenu();
              }}
              className="p-1.5 rounded-full bg-white/90 hover:bg-white border border-stone-200 text-stone-600 hover:text-emerald-800 shadow-2xs cursor-pointer"
              title={lang === "bn" ? "মেনু ও ইমোজি" : "Reactions & Options"}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* REACTION PILLS BELOW BUBBLE */}
        {reactionEntries.length > 0 && (
          <div
            className={`flex flex-wrap gap-1 mt-1 ${
              isMine ? "justify-end" : "justify-start"
            }`}
          >
            {reactionEntries.map(([emoji, users]) => {
              const hasReacted = currentUsername && users.includes(currentUsername);
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onToggleReaction(emoji)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shadow-2xs transition cursor-pointer border ${
                    hasReacted
                      ? "bg-amber-100/90 border-amber-300 text-emerald-950 font-bold"
                      : "bg-white/90 border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="text-[10px]">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

