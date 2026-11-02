"use client";

import React from "react";
import {
  Copy,
  CornerUpLeft,
  Download,
  Edit2,
  Pin,
  Trash2,
  User,
} from "lucide-react";
import { FamilyChatMessage, Language } from "@/types/family";
import { vibrateDevice } from "@/lib/notificationUtils";
import { REACTION_EMOJIS, formatMessageTime } from "./chatUtils";

interface ChatActionSheetProps {
  message: FamilyChatMessage | null;
  onClose: () => void;
  currentUsername: string | null;
  isAdmin: boolean;
  lang: Language;
  onToggleReaction: (msg: FamilyChatMessage, emoji: string) => void;
  onStartReply: (msg: FamilyChatMessage) => void;
  onDownloadImage: (url: string, id: string) => void;
  onOpenProfile: (username: string, authorDisplayName: string, photoUrl?: string) => void;
  onCopyText: (msg: FamilyChatMessage) => void;
  onTogglePin: (msg: FamilyChatMessage) => void;
  onStartEdit: (msg: FamilyChatMessage) => void;
  onDeleteMessage: (msg: FamilyChatMessage) => void;
  getDisplayAuthorName: (msg: FamilyChatMessage) => string;
}

export default function ChatActionSheet({
  message,
  onClose,
  currentUsername,
  isAdmin,
  lang,
  onToggleReaction,
  onStartReply,
  onDownloadImage,
  onOpenProfile,
  onCopyText,
  onTogglePin,
  onStartEdit,
  onDeleteMessage,
  getDisplayAuthorName,
}: ChatActionSheetProps) {
  if (!message) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-3 animate-in fade-in duration-150"
    >
      {/* Reaction Emojis Floating Pill */}
      {currentUsername && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-stone-200/90 px-3.5 py-2 flex items-center gap-2 sm:gap-3 mb-3 animate-in zoom-in-95 duration-150"
        >
          {REACTION_EMOJIS.map((emoji) => {
            const hasReacted =
              currentUsername && message.reactions?.[emoji]?.includes(currentUsername);
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  vibrateDevice([20]);
                  onToggleReaction(message, emoji);
                  onClose();
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:scale-125 active:scale-95 transition cursor-pointer ${
                  hasReacted
                    ? "bg-amber-100 ring-2 ring-amber-400 scale-110"
                    : "hover:bg-stone-100"
                }`}
                title={emoji}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      )}

      {/* Action List Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-stone-200 overflow-hidden divide-y divide-stone-100 text-sm animate-in slide-in-from-bottom-3 sm:zoom-in-95 duration-150"
      >
        {/* Target Message preview */}
        <div className="px-4 py-2.5 bg-stone-50 text-stone-500 text-xs flex items-center justify-between">
          <span className="font-bold text-stone-700 truncate max-w-[200px]">
            {getDisplayAuthorName(message)}
          </span>
          <span className="text-[11px] text-stone-400">
            {formatMessageTime(message.createdAt, lang)}
          </span>
        </div>

        {/* 1. Reply */}
        {currentUsername && (
          <button
            type="button"
            onClick={() => {
              onStartReply(message);
              onClose();
            }}
            className="w-full px-4 py-3 hover:bg-stone-50 flex items-center justify-between text-stone-800 font-semibold transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <CornerUpLeft className="w-4 h-4 text-emerald-700" />
              <span>{lang === "bn" ? "রিপ্লাই দিন" : "Reply"}</span>
            </div>
            <span className="text-[11px] text-stone-400 font-normal">
              {lang === "bn" ? "ডানে সোয়াইপ" : "Swipe right"}
            </span>
          </button>
        )}

        {/* 2. Download Image (if message has image) */}
        {message.imageUrl && (
          <button
            type="button"
            onClick={() => {
              onDownloadImage(message.imageUrl!, message.id);
              onClose();
            }}
            className="w-full px-4 py-3 hover:bg-stone-50 flex items-center gap-2.5 text-stone-800 font-semibold transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>{lang === "bn" ? "ছবি ডাউনলোড করুন" : "Save Image"}</span>
          </button>
        )}

        {/* 3. View Sender Profile */}
        <button
          type="button"
          onClick={() => {
            onOpenProfile(
              message.authorUsername,
              getDisplayAuthorName(message),
              message.authorPhotoUrl
            );
            onClose();
          }}
          className="w-full px-4 py-3 hover:bg-stone-50 flex items-center gap-2.5 text-stone-800 font-semibold transition cursor-pointer"
        >
          <User className="w-4 h-4 text-emerald-700" />
          <span>
            {lang === "bn"
              ? `${getDisplayAuthorName(message)}-এর প্রোফাইল দেখুন`
              : `View ${getDisplayAuthorName(message)}'s Profile`}
          </span>
        </button>

        {/* 4. Copy Text */}
        {message.text && (
          <button
            type="button"
            onClick={() => {
              onCopyText(message);
              onClose();
            }}
            className="w-full px-4 py-3 hover:bg-stone-50 flex items-center gap-2.5 text-stone-800 font-semibold transition cursor-pointer"
          >
            <Copy className="w-4 h-4 text-stone-600" />
            <span>{lang === "bn" ? "টেক্সট কপি করুন" : "Copy Text"}</span>
          </button>
        )}

        {/* 5. Pin / Unpin */}
        {currentUsername && (
          <button
            type="button"
            onClick={() => {
              onTogglePin(message);
              onClose();
            }}
            className="w-full px-4 py-3 hover:bg-stone-50 flex items-center gap-2.5 text-stone-800 font-semibold transition cursor-pointer"
          >
            <Pin className="w-4 h-4 text-amber-600" />
            <span>
              {message.isPinned
                ? lang === "bn"
                  ? "আনপিন করুন"
                  : "Unpin Message"
                : lang === "bn"
                ? "পিন করুন"
                : "Pin Message"}
            </span>
          </button>
        )}

        {/* 6. Edit (if own) */}
        {message.authorUsername === currentUsername && (
          <button
            type="button"
            onClick={() => {
              onStartEdit(message);
              onClose();
            }}
            className="w-full px-4 py-3 hover:bg-stone-50 flex items-center gap-2.5 text-blue-700 font-semibold transition cursor-pointer"
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
            <span>{lang === "bn" ? "বার্তা এডিট করুন" : "Edit Message"}</span>
          </button>
        )}

        {/* 7. Delete (if own or admin) */}
        {(message.authorUsername === currentUsername || isAdmin) && (
          <button
            type="button"
            onClick={() => {
              onDeleteMessage(message);
              onClose();
            }}
            className="w-full px-4 py-3 hover:bg-rose-50 flex items-center gap-2.5 text-rose-700 font-semibold transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>{lang === "bn" ? "বার্তা মুছুন" : "Delete Message"}</span>
          </button>
        )}

        {/* 8. Cancel */}
        <button
          type="button"
          onClick={onClose}
          className="w-full px-4 py-2.5 bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-500 text-xs font-bold transition cursor-pointer"
        >
          {lang === "bn" ? "বাতিল" : "Cancel"}
        </button>
      </div>
    </div>
  );
}

