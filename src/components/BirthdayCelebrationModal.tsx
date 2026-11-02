"use client";

import React, { useEffect, useState } from "react";
import { X, Sparkles, MessageCircle, Cake, Calendar, Heart } from "lucide-react";
import { FamilyMember, Language } from "@/types/family";
import Link from "next/link";

interface BirthdayCelebrationModalProps {
  todayBirthdays: Array<{
    member: FamilyMember;
    age?: number;
  }>;
  lang: Language;
  onClose: () => void;
  onSendWish: (member: FamilyMember) => void;
}

export default function BirthdayCelebrationModal({
  todayBirthdays,
  lang,
  onClose,
  onSendWish,
}: BirthdayCelebrationModalProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!todayBirthdays || todayBirthdays.length === 0) return null;

  const current = todayBirthdays[activeIdx] || todayBirthdays[0];
  const member = current.member;
  const age = current.age;

  const memberName = lang === "bn" ? member.nameBn : member.nameEn;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gradient-to-b from-amber-500 via-amber-600 to-emerald-950 text-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-amber-300/40 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Floating Confetti / Sparkle Shapes */}
        <div className="absolute top-2 left-3 text-amber-200 text-lg animate-bounce duration-1000">🎉</div>
        <div className="absolute top-8 right-6 text-yellow-300 text-xl animate-pulse">✨</div>
        <div className="absolute bottom-16 left-4 text-rose-300 text-lg animate-bounce duration-700">🎈</div>
        <div className="absolute bottom-24 right-5 text-amber-200 text-base">🎂</div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-black/25 hover:bg-black/40 text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cake Badge */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-300 text-emerald-950 flex items-center justify-center shadow-lg border-2 border-white/40 mb-3 animate-pulse">
          <Cake className="w-9 h-9 stroke-[2.2]" />
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-amber-100 mb-2 border border-white/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{lang === "bn" ? "আজকের শুভ জন্মদিন!" : "Today's Birthday Celebration!"}</span>
        </div>

        {/* Person's Photo & Age */}
        <div className="relative w-24 h-24 mx-auto my-3">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={memberName}
              className="w-full h-full rounded-3xl object-cover border-3 border-amber-300 shadow-xl"
            />
          ) : (
            <div className="w-full h-full rounded-3xl bg-emerald-900 border-3 border-amber-300 flex items-center justify-center text-3xl font-black text-amber-300 shadow-xl">
              {memberName.charAt(0).toUpperCase()}
            </div>
          )}
          {age !== undefined && age > 0 && (
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-black text-xs shadow-md border-2 border-white">
              {age} {lang === "bn" ? "বছর" : "yrs"}
            </span>
          )}
        </div>

        {/* Name & Branch */}
        <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm mb-1">
          {memberName}
        </h2>
        {member.professionBn && (
          <p className="text-xs text-amber-100 font-medium mb-3">
            {lang === "bn" ? member.professionBn : member.professionEn}
          </p>
        )}

        <p className="text-xs text-emerald-100/90 leading-relaxed mb-5 bg-black/20 p-2.5 rounded-2xl border border-white/10">
          {lang === "bn"
            ? "পরিবারের পক্ষ থেকে শুভ জন্মদিন! আপনার সুস্বাস্থ্য, দীর্ঘায়ু ও জীবনের সর্বাঙ্গীন মঙ্গল কামনা করি।"
            : "Happy Birthday from the whole family! Wishing you joy, health, and endless blessings."}
        </p>

        {/* Multi-birthday switcher if more than 1 person today */}
        {todayBirthdays.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {todayBirthdays.map((b, idx) => (
              <button
                key={b.member.id}
                onClick={() => setActiveIdx(idx)}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  idx === activeIdx ? "bg-amber-300 w-5" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Action Button: Send Birthday Wish in Chat */}
        <button
          type="button"
          onClick={() => {
            onSendWish(member);
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
        >
          <MessageCircle className="w-4 h-4 fill-emerald-950" />
          <span>{lang === "bn" ? "চ্যাটে শুভেচ্ছা জানান" : "Send Birthday Wish"}</span>
        </button>
      </div>
    </div>
  );
}

