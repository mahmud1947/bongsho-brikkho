"use client";

import React, { useEffect, useRef, useState } from "react";
import { LogIn, MessageCircle, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { FamilyChatMessage, Language, UserProfile } from "@/types/family";

interface FamilyChatProps {
  messages: FamilyChatMessage[];
  lang: Language;
  currentUsername: string | null;
  currentUserProfile: UserProfile | null;
  isAdmin: boolean;
  onSend: (message: FamilyChatMessage) => Promise<void>;
  onDelete: (id: string) => void;
}

export default function FamilyChat({
  messages, lang, currentUsername, currentUserProfile, isAdmin, onSend, onDelete,
}: FamilyChatProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() || !currentUsername || isSending) return;
    setIsSending(true);
    try {
      await onSend({
        id: `chat-${Date.now()}`,
        text: text.trim(),
        authorUsername: currentUsername,
        authorName: lang === "bn"
          ? (currentUserProfile?.nameBn || currentUserProfile?.nameEn || currentUsername)
          : (currentUserProfile?.nameEn || currentUserProfile?.nameBn || currentUsername),
        createdAt: new Date().toISOString(),
      });
      setText("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto h-[calc(100vh-8.5rem)] min-h-[500px] flex flex-col bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
      <header className="px-4 sm:px-5 py-3.5 bg-emerald-950 text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold">{lang === "bn" ? "পারিবারিক চ্যাট" : "Family Chat"}</h2>
          <p className="text-xs text-emerald-200">{lang === "bn" ? "পরিবারের সবার সাথে কথা বলুন" : "Talk with everyone in the family"}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-stone-50/70">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-stone-500">
            <MessageCircle className="w-10 h-10 text-amber-500 mb-3" />
            <p className="font-semibold text-stone-700">{lang === "bn" ? "এখনও কোনো বার্তা নেই" : "No messages yet"}</p>
            <p className="text-xs mt-1">{lang === "bn" ? "প্রথম বার্তাটি পাঠান।" : "Start the conversation."}</p>
          </div>
        ) : messages.map((message) => {
          const isMine = message.authorUsername === currentUsername;
          return (
            <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`group max-w-[82%] rounded-2xl px-3.5 py-2.5 ${isMine ? "bg-emerald-900 text-white rounded-br-md" : "bg-white border border-stone-200 text-stone-800 rounded-bl-md"}`}>
                <div className={`flex items-center gap-2 text-[11px] mb-1 ${isMine ? "text-emerald-100" : "text-stone-500"}`}>
                  <span className="font-bold">{isMine ? (lang === "bn" ? "আপনি" : "You") : message.authorName}</span>
                  <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                  {(isMine || isAdmin) && <button onClick={() => onDelete(message.id)} className="opacity-60 hover:opacity-100 cursor-pointer" aria-label="Delete message"><Trash2 className="w-3 h-3" /></button>}
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {currentUsername ? (
        <form onSubmit={handleSend} className="p-3 border-t border-stone-200 flex gap-2 bg-white">
          <input value={text} onChange={(event) => setText(event.target.value)} placeholder={lang === "bn" ? "একটি বার্তা লিখুন..." : "Write a message..."} className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
          <button type="submit" disabled={!text.trim() || isSending} className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center disabled:opacity-50 cursor-pointer"><Send className="w-4 h-4" /></button>
        </form>
      ) : (
        <div className="p-3 border-t border-stone-200 bg-white text-center text-sm text-stone-600">
          <Link href="/profile" className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950"><LogIn className="w-4 h-4" />{lang === "bn" ? "চ্যাট করতে প্রোফাইলে লগইন করুন" : "Log in from Profile to chat"}</Link>
        </div>
      )}
    </section>
  );
}
