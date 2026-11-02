"use client";

import React from "react";
import { FamilyMember, Language } from "@/types/family";
import { getBranchStyle } from "./treeUtils";

interface TreeBranchBarProps {
  lang: Language;
  g2Members: FamilyMember[];
  childrenMap: Record<string, FamilyMember[]>;
  selectedBranchId: string;
  onExpandAll: () => void;
  onResetToOverview: () => void;
  onExpandBranch: (g2MemberId: string) => void;
}

export default function TreeBranchBar({
  lang,
  g2Members,
  childrenMap,
  selectedBranchId,
  onExpandAll,
  onResetToOverview,
  onExpandBranch,
}: TreeBranchBarProps) {
  if (g2Members.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-stone-200 px-2.5 py-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1 text-stone-500 text-xs font-bold flex-shrink-0 pr-1.5 border-r border-stone-200">
        <span className="text-emerald-700">🌿</span>
        <span>{lang === "bn" ? "শাখা" : "Branch"}</span>
      </div>

      {/* 1. All Button (Fully opens all branches) */}
      <button
        type="button"
        onClick={onExpandAll}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
          selectedBranchId === "full-tree"
            ? "bg-emerald-900 text-amber-300 shadow-sm"
            : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/60"
        }`}
        title={lang === "bn" ? "সব শাখা একসাথে সম্পূর্ণ দেখুন" : "View all branches together"}
      >
        {lang === "bn" ? "সব (All)" : "All"}
      </button>

      {/* 2. G1 & G2 Overview Button */}
      <button
        type="button"
        onClick={onResetToOverview}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
          selectedBranchId === "all"
            ? "bg-emerald-900 text-amber-300 shadow-sm"
            : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/60"
        }`}
        title={lang === "bn" ? "শুধু মূল ও প্রথম প্রজন্ম দেখুন" : "View G1 & G2 overview"}
      >
        {lang === "bn" ? "G1 ও G2" : "G1 & G2"}
      </button>

      {/* Individual G2 Branch Buttons */}
      {g2Members.map((g2) => {
        const isSelected = selectedBranchId === g2.id;
        const branchStyle = getBranchStyle(g2.branchId);
        const branchName = lang === "bn" ? g2.nameBn : g2.nameEn;
        const childCount = (childrenMap[g2.id] || []).length;

        return (
          <button
            key={g2.id}
            type="button"
            onClick={() => onExpandBranch(g2.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 cursor-pointer ${
              isSelected
                ? "bg-amber-400 text-emerald-950 shadow-sm ring-2 ring-emerald-900"
                : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/60"
            }`}
            title={lang === "bn" ? `${branchName}-এর পরিবার দেখুন` : `View ${branchName}'s Family`}
          >
            <span className={`w-2 h-2 rounded-full ${branchStyle.header.split(" ")[0] || "bg-emerald-600"}`} />
            <span>{branchName}</span>
            {childCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? "bg-emerald-950 text-amber-300 font-bold"
                    : "bg-stone-200 text-stone-700"
                }`}
              >
                {childCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

