"use client";

import React, { useState } from "react";
import { LogIn, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { Language } from "@/types/family";

interface ChatQuickLoginFormProps {
  lang: Language;
  onQuickLogin?: (username: string, displayName: string) => Promise<void>;
}

export default function ChatQuickLoginForm({
  lang,
  onQuickLogin,
}: ChatQuickLoginFormProps) {
  const [quickName, setQuickName] = useState("");
  const [quickUsername, setQuickUsername] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onQuickLogin) return;
    const rawName = quickName.trim();
    const generatedUser =
      quickUsername.trim() ||
      rawName
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "") ||
      `member_${Date.now().toString().slice(-4)}`;

    if (!rawName && !quickUsername.trim()) return;
    setIsLoggingIn(true);
    try {
      await onQuickLogin(generatedUser, rawName || generatedUser);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-4 border-t border-stone-200 bg-gradient-to-b from-stone-50 to-white z-20 flex-shrink-0">
      {onQuickLogin ? (
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {lang === "bn"
                  ? "চ্যাটে অংশ নিতে আপনার নাম লিখুন"
                  : "Enter your name to join the chat"}
              </span>
            </div>
            <Link
              href="/profile"
              className="text-[11px] font-semibold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" />
              <span>{lang === "bn" ? "সম্পূর্ণ প্রোফাইল" : "Full Profile"}</span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              required
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              placeholder={
                lang === "bn"
                  ? "আপনার নাম (যেমন: আব্দুল করিম)"
                  : "Your Name (e.g. Abdul Karim)"
              }
              className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <input
              type="text"
              value={quickUsername}
              onChange={(e) => setQuickUsername(e.target.value)}
              placeholder={
                lang === "bn" ? "@ইউজারনেম (ঐচ্ছিক)" : "@username (optional)"
              }
              className="sm:w-40 px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="submit"
              disabled={!quickName.trim() || isLoggingIn}
              className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-xs sm:text-sm shadow-xs disabled:opacity-50 cursor-pointer transition flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{lang === "bn" ? "চ্যাট শুরু করুন" : "Start Chat"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center text-sm text-stone-600">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950"
          >
            <LogIn className="w-4 h-4" />
            {lang === "bn"
              ? "চ্যাট করতে প্রোফাইলে লগইন করুন"
              : "Log in from Profile to chat"}
          </Link>
        </div>
      )}
    </div>
  );
}
