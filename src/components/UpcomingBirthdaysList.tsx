"use client";

import React from "react";
import { Cake, Calendar, MessageCircle, Gift } from "lucide-react";
import { FamilyMember, Language } from "@/types/family";

export interface UpcomingBirthdayItem {
  member: FamilyMember;
  daysRemaining: number;
  birthDateFormatted: string;
  calculatedAge?: number;
}

interface UpcomingBirthdaysListProps {
  birthdays: UpcomingBirthdayItem[];
  lang: Language;
  onSendWish: (member: FamilyMember) => void;
  onSelectMember?: (member: FamilyMember) => void;
}

export default function UpcomingBirthdaysList({
  birthdays,
  lang,
  onSendWish,
  onSelectMember,
}: UpcomingBirthdaysListProps) {
  if (!birthdays || birthdays.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Cake className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">
              {lang === "bn" ? "আসন্ন জন্মদিন" : "Upcoming Birthdays"}
            </h3>
            <p className="text-[11px] text-stone-500">
              {lang === "bn"
                ? "পরিবারের পরবর্তী জন্মদিনগুলো"
                : "Next upcoming family celebrations"}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
          <Gift className="w-3 h-3 text-amber-600" />
          <span>{birthdays.length}</span>
        </span>
      </div>

      <div className="divide-y divide-stone-100">
        {birthdays.map((item) => {
          const m = item.member;
          const name = lang === "bn" ? m.nameBn : m.nameEn;
          const isToday = item.daysRemaining === 0;
          const isTomorrow = item.daysRemaining === 1;

          return (
            <div
              key={m.id}
              className={`py-2.5 flex items-center justify-between gap-3 transition-colors ${
                isToday ? "bg-amber-50/60 -mx-2 px-2 rounded-2xl" : ""
              }`}
            >
              <div
                onClick={() => onSelectMember && onSelectMember(m)}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
              >
                <div className="relative flex-shrink-0">
                  {m.photoUrl ? (
                    <img
                      src={m.photoUrl}
                      alt={name}
                      className="w-10 h-10 rounded-2xl object-cover border border-stone-200 group-hover:border-emerald-600 transition"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-emerald-900 text-amber-300 font-bold text-xs flex items-center justify-center">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isToday && (
                    <span className="absolute -top-1 -right-1 text-xs animate-bounce">
                      🎂
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-stone-800 text-xs sm:text-sm truncate group-hover:text-emerald-800 transition">
                    {name}
                  </p>
                  <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                    <span className="font-medium text-stone-600">
                      {item.birthDateFormatted}
                    </span>
                    {item.calculatedAge && (
                      <span className="text-amber-800 font-semibold">
                        • {item.calculatedAge} {lang === "bn" ? "বছর" : "yrs"}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isToday
                      ? "bg-rose-500 text-white animate-pulse"
                      : isTomorrow
                      ? "bg-amber-400 text-emerald-950 font-black"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {isToday
                    ? lang === "bn"
                      ? "আজকে!"
                      : "Today!"
                    : isTomorrow
                    ? lang === "bn"
                      ? "আগামীকাল"
                      : "Tomorrow"
                    : lang === "bn"
                    ? `${item.daysRemaining} দিন পর`
                    : `In ${item.daysRemaining} days`}
                </span>

                <button
                  type="button"
                  onClick={() => onSendWish(m)}
                  className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 cursor-pointer transition border border-emerald-200/70"
                  title={lang === "bn" ? "শুভেচ্ছা জানান" : "Send Wish"}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
