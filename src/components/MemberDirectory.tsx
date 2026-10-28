"use client";

import React, { useState, useMemo } from "react";
import { Search, MapPin, Briefcase, Phone, Filter, UserPlus } from "lucide-react";
import { BloodGroup, FamilyBranch, FamilyMember, Language } from "@/types/family";

interface MemberDirectoryProps {
  members: FamilyMember[];
  branches: FamilyBranch[];
  lang: Language;
  onSelectMember: (m: FamilyMember) => void;
  onAddMember: () => void;
}

const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function MemberDirectory({
  members,
  branches,
  lang,
  onSelectMember,
  onAddMember,
}: MemberDirectoryProps) {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [genFilter, setGenFilter] = useState("all");
  const [bloodFilter, setBloodFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (branchFilter !== "all" && m.branchId !== branchFilter) return false;
      if (genFilter !== "all" && m.generation !== Number(genFilter)) return false;
      if (bloodFilter !== "all" && m.bloodGroup !== bloodFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          m.nameBn.toLowerCase().includes(q) ||
          m.nameEn.toLowerCase().includes(q) ||
          m.nicknameBn?.toLowerCase().includes(q) ||
          m.professionBn.toLowerCase().includes(q) ||
          m.professionEn.toLowerCase().includes(q) ||
          m.locationBn.toLowerCase().includes(q) ||
          m.locationEn.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [members, search, branchFilter, genFilter, bloodFilter]);

  return (
    <div className="space-y-4">
      {/* Compact Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "bn" ? "খুঁজুন..." : "Search..."}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 text-stone-800 text-xs font-bold"
          >
            <Filter className="w-3.5 h-3.5" />
            {lang === "bn" ? "ফিল্টার" : "Filter"}
          </button>
        </div>

        <div className={`${showFilters ? "grid" : "hidden md:grid"} grid-cols-3 gap-2`}>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white"
          >
            <option value="all">{lang === "bn" ? "শাখা" : "Branch"}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {lang === "bn" ? b.nameBn : b.nameEn}
              </option>
            ))}
          </select>

          <select
            value={genFilter}
            onChange={(e) => setGenFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white"
          >
            <option value="all">{lang === "bn" ? "প্রজন্ম" : "Gen"}</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
              <option key={g} value={g}>
                G{g}
              </option>
            ))}
          </select>

          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white font-bold text-rose-700"
          >
            <option value="all">{lang === "bn" ? "রক্ত" : "Blood"}</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Member Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <button
            onClick={onAddMember}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-sm font-bold shadow cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === "bn" ? "যোগ" : "Add"}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => onSelectMember(m)}
              className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-500 p-4 shadow-sm transition cursor-pointer space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-900">
                  G{m.generation}
                </span>
                <div className="flex items-center gap-1.5">
                  {m.bloodGroup !== "Unknown" && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700">
                      🩸 {m.bloodGroup}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-600">
                    {m.isAlive ? (lang === "bn" ? "জীবিত" : "Living") : lang === "bn" ? "প্রয়াত" : "Late"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base truncate">
                  {lang === "bn" ? m.nameBn : m.nameEn}
                </h3>
                {(m.nicknameBn || m.nicknameEn) && (
                  <p className="text-xs text-amber-700 font-semibold">
                    {lang === "bn" ? m.nicknameBn : m.nicknameEn}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-stone-100 space-y-1 text-xs text-stone-600">
                <div className="flex items-center gap-1.5 truncate">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                  <span className="truncate">{lang === "bn" ? m.professionBn : m.professionEn}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span className="truncate">{lang === "bn" ? m.locationBn : m.locationEn}</span>
                </div>
                {m.phone && (
                  <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                    <Phone className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                    <span>{m.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
