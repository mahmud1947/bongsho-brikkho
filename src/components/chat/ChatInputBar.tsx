"use client";

import React, { useRef } from "react";
import { CornerUpLeft, Edit2, ImagePlus, Send, X } from "lucide-react";
import { FamilyChatMessage, FamilyMember, Language } from "@/types/family";
import VoiceRecorder from "@/components/VoiceRecorder";

interface ChatInputBarProps {
  text: string;
  onTextChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e?: React.FormEvent) => void;
  selectedImage: string | null;
  onClearSelectedImage: () => void;
  onSelectImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isCompressingImage: boolean;
  isSending: boolean;
  editingMessage: FamilyChatMessage | null;
  onCancelEdit: () => void;
  replyingTo: FamilyChatMessage | null;
  onCancelReply: () => void;
  getDisplayAuthorName: (msg: FamilyChatMessage) => string;
  activeTypingNames: string | null;
  showMentionSuggestions: boolean;
  mentionSuggestions: FamilyMember[];
  onSelectMention: (member: FamilyMember) => void;
  onSendVoice: (audioUrl: string, durationSeconds: number) => Promise<void>;
  currentUsername: string | null;
  lang: Language;
}

export default function ChatInputBar({
  text,
  onTextChange,
  onKeyDown,
  onSubmit,
  selectedImage,
  onClearSelectedImage,
  onSelectImage,
  isCompressingImage,
  isSending,
  editingMessage,
  onCancelEdit,
  replyingTo,
  onCancelReply,
  getDisplayAuthorName,
  activeTypingNames,
  showMentionSuggestions,
  mentionSuggestions,
  onSelectMention,
  onSendVoice,
  currentUsername,
  lang,
}: ChatInputBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="border-t border-stone-200 bg-white z-20 flex-shrink-0 relative">
      {/* REAL-TIME TYPING INDICATOR BAR */}
      {activeTypingNames && (
        <div className="px-3.5 py-1 text-[11px] text-emerald-900 bg-emerald-50/95 border-b border-emerald-100/80 flex items-center gap-2 animate-in fade-in duration-150">
          <span className="flex items-center gap-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </span>
          <span className="font-semibold">
            {activeTypingNames} {lang === "bn" ? "লিখছেন..." : "is typing..."}
          </span>
        </div>
      )}

      {/* EDITING MESSAGE PREVIEW BANNER */}
      {editingMessage && (
        <div className="px-3.5 py-2 bg-blue-50 border-b border-blue-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Edit2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="font-bold text-blue-900">
              {lang === "bn" ? "বার্তা এডিট করছেন" : "Editing message"}
            </span>
            <span className="text-blue-700 truncate text-[11px]">
              {editingMessage.text}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelEdit}
            className="p-1 rounded-lg hover:bg-blue-100 text-blue-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* REPLYING-TO PREVIEW BANNER */}
      {replyingTo && !editingMessage && (
        <div className="px-3.5 py-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <CornerUpLeft className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
            <span className="font-bold text-emerald-950">
              {lang === "bn" ? "রিপ্লাই দিচ্ছেন" : "Replying to"}
            </span>
            <span className="font-semibold text-emerald-800">
              {getDisplayAuthorName(replyingTo)}:
            </span>
            <span className="text-stone-500 truncate text-[11px]">
              {replyingTo.text || (replyingTo.audioUrl ? "🎤 Voice Note" : "📷 Photo")}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 rounded-lg hover:bg-stone-200 text-stone-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SELECTED IMAGE PREVIEW BANNER */}
      {selectedImage && (
        <div className="px-3.5 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-emerald-600/40 shadow-xs bg-white">
              <img
                src={selectedImage}
                alt="Selected preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs">
              <span className="font-bold text-emerald-950 block">
                {lang === "bn" ? "ছবি যুক্ত করা হয়েছে" : "Photo attached"}
              </span>
              <span className="text-[11px] text-stone-500">
                {lang === "bn"
                  ? "সাথে কিছু লিখতে পারেন বা সরাসরি পাঠান"
                  : "Add a caption or send directly"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearSelectedImage}
            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer transition"
            title={lang === "bn" ? "ছবি সরান" : "Remove photo"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MENTION (@) AUTOCOMPLETE POPUP */}
      {showMentionSuggestions && mentionSuggestions.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 max-h-52 overflow-y-auto bg-white border border-stone-200 rounded-t-2xl shadow-2xl z-30 divide-y divide-stone-100 mb-0 animate-in slide-in-from-bottom-2">
          <div className="px-3 py-1.5 bg-emerald-950 text-white text-[11px] font-bold flex items-center justify-between">
            <span>{lang === "bn" ? "কাউকে মেনশন করুন (@)" : "Mention someone (@)"}</span>
            <span className="text-[10px] text-emerald-200">{mentionSuggestions.length} matches</span>
          </div>
          {mentionSuggestions.map((m) => {
            const name = lang === "bn" ? m.nameBn : m.nameEn;
            const handle =
              m.username || m.nameEn.toLowerCase().replace(/[^a-z0-9]/g, "");
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMention(m)}
                className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-emerald-50 text-left transition cursor-pointer"
              >
                {m.photoUrl ? (
                  <img
                    src={m.photoUrl}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover border border-stone-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-amber-300 font-bold text-[10px] flex items-center justify-center">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-xs font-bold text-stone-800 block truncate">
                    {name}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    @{handle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* MAIN INPUT FORM */}
      <form
        onSubmit={onSubmit}
        className="p-2 sm:p-2.5 flex items-end gap-1.5 sm:gap-2 bg-white"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onSelectImage}
          className="hidden"
        />

        {/* Photo Attachment Button */}
        {!editingMessage && (
          <button
            type="button"
            disabled={isCompressingImage || isSending}
            onClick={() => fileInputRef.current?.click()}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition cursor-pointer ${
              selectedImage
                ? "bg-emerald-900 text-amber-300"
                : "bg-stone-100 hover:bg-emerald-50 text-emerald-800 border border-stone-200/80"
            }`}
            title={lang === "bn" ? "ছবি পাঠান" : "Attach Photo"}
          >
            <ImagePlus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Voice Message Recorder (Hold/Stop/Send/Cancel) */}
        {!editingMessage && (
          <VoiceRecorder
            lang={lang}
            disabled={!currentUsername || isSending}
            onSendVoice={onSendVoice}
          />
        )}

        {/* Textarea */}
        <div className="flex-1 min-w-0 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => {
              setTimeout(() => {
                textareaRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
              }, 200);
            }}
            placeholder={
              isCompressingImage
                ? lang === "bn"
                  ? "ছবি প্রস্তুত হচ্ছে..."
                  : "Preparing photo..."
                : "Write message..."
            }
            className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-200/90 bg-stone-50 focus:bg-white text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none max-h-32 leading-snug"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!text.trim() && !selectedImage) || isSending}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 flex items-center justify-center flex-shrink-0 shadow-xs disabled:opacity-40 transition cursor-pointer"
          title={lang === "bn" ? "বার্তা পাঠান" : "Send Message"}
        >
          <Send className="w-4 h-4 stroke-[2.3]" />
        </button>
      </form>
    </div>
  );
}

