"use client";

import React from "react";
import { Network, LayoutList, Search, Scan } from "lucide-react";
import { FamilyMember, Language } from "@/types/family";

interface TreeToolbarProps {
  lang: Language;
  viewMode: "canvas" | "mobile-tree";
  setViewMode: (mode: "canvas" | "mobile-tree") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  matchingMembers: FamilyMember[];
  onSelectSearchMember: (member: FamilyMember) => void;
  onFitScreen: () => void;
}

export default function TreeToolbar({
  lang,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  matchingMembers,
  onSelectSearchMember,
  onFitScreen,
}: TreeToolbarProps) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-2 sm:p-2.5 shadow-sm flex items-center gap-1.5 sm:gap-2.5 w-full">
      {/* Left: View Switcher (Chart / List) */}
      <div className="flex bg-stone-100 p-0.5 sm:p-1 rounded-xl flex-shrink-0">
        <button
          onClick={() => setViewMode("canvas")}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
            viewMode === "canvas"
              ? "bg-emerald-900 text-amber-300 shadow-sm"
              : "text-stone-600 hover:text-stone-900"
          }`}
          title={lang === "bn" ? "চার্ট ভিউ" : "Chart View"}
        >
          <Network className="w-3.5 h-3.5" />
          <span>{lang === "bn" ? "চার্ট" : "Chart"}</span>
        </button>
        <button
          onClick={() => setViewMode("mobile-tree")}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
            viewMode === "mobile-tree"
              ? "bg-emerald-900 text-amber-300 shadow-sm"
              : "text-stone-600 hover:text-stone-900"
          }`}
          title={lang === "bn" ? "লিস্ট ভিউ" : "List View"}
        >
          <LayoutList className="w-3.5 h-3.5" />
          <span>{lang === "bn" ? "লিস্ট" : "List"}</span>
        </button>
      </div>

      {/* Middle: Search Input */}
      <div className="relative flex-1 min-w-0">
        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === "bn" ? "সার্চ..." : "Search..."}
          className="w-full pl-7 sm:pl-8 pr-2.5 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50 focus:bg-white transition"
        />
        {matchingMembers.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-stone-200 z-30 max-h-48 overflow-y-auto divide-y divide-stone-100">
            {matchingMembers.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelectSearchMember(m)}
                className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-xs font-bold text-stone-800 truncate cursor-pointer"
              >
                {lang === "bn" ? m.nameBn : m.nameEn}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Fit Screen Button */}
      {viewMode === "canvas" && (
        <button
          onClick={onFitScreen}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-900 text-amber-300 text-xs font-bold cursor-pointer hover:bg-emerald-800 shadow-sm flex-shrink-0"
          title={lang === "bn" ? "স্ক্রিনে ফিট করুন" : "Fit to screen"}
        >
          <Scan className="w-3.5 h-3.5" />
          <span>{lang === "bn" ? "ফিট" : "Fit"}</span>
        </button>
      )}
    </div>
  );
}
