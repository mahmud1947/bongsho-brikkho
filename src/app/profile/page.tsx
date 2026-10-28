"use client";

import React, { useEffect } from "react";
import {
  User,
  Heart,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  Droplets,
  Calendar,
  UserPlus,
  Edit3,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { useFamily } from "@/context/FamilyContext";

export default function ProfilePage() {
  const {
    members,
    branches,
    lang,
    selectedMember,
    setSelectedMember,
    openAddModal,
    openEditModal,
    deleteMember,
  } = useFamily();

  const activeMember = selectedMember || members[0] || null;

  useEffect(() => {
    if (!selectedMember && members.length > 0) {
      setSelectedMember(members[0]);
    }
  }, [members, selectedMember, setSelectedMember]);

  if (!activeMember) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
        <button
          onClick={() => openAddModal(null)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-sm font-bold shadow cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{lang === "bn" ? "যোগ" : "Add"}</span>
        </button>
      </div>
    );
  }

  const parent = members.find((m) => m.id === activeMember.parentId) || null;
  const children = members.filter((m) => m.parentId === activeMember.id);
  const siblings = activeMember.parentId
    ? members.filter(
        (m) => m.parentId === activeMember.parentId && m.id !== activeMember.id
      )
    : [];
  const branch = branches.find((b) => b.id === activeMember.branchId);

  return (
    <div className="space-y-4">
      {/* Member Selector Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
          <User className="w-4 h-4 text-emerald-700" />
          <span>{lang === "bn" ? "প্রোফাইল" : "Profile"}</span>
        </div>

        <select
          value={activeMember.id}
          onChange={(e) => {
            const found = members.find((m) => m.id === e.target.value);
            if (found) setSelectedMember(found);
          }}
          className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {lang === "bn" ? m.nameBn : m.nameEn} (G{m.generation})
            </option>
          ))}
        </select>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Top Banner */}
        <div className="bg-emerald-950 p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-emerald-950 font-extrabold text-xl flex items-center justify-center flex-shrink-0">
              G{activeMember.generation}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {branch && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-800 text-emerald-100">
                    {lang === "bn" ? branch.nameBn : branch.nameEn}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/15 text-amber-200">
                  {activeMember.isAlive
                    ? lang === "bn"
                      ? "জীবিত"
                      : "Living"
                    : lang === "bn"
                    ? "প্রয়াত"
                    : "Late"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold truncate">
                {lang === "bn" ? activeMember.nameBn : activeMember.nameEn}
              </h2>
              {(activeMember.nicknameBn || activeMember.nicknameEn) && (
                <p className="text-xs text-amber-300 font-semibold">
                  {lang === "bn"
                    ? activeMember.nicknameBn
                    : activeMember.nicknameEn}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal(activeMember)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {lang === "bn" ? "সম্পাদনা" : "Edit"}
            </button>
            <button
              onClick={() => openAddModal(activeMember)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              {lang === "bn" ? "সন্তান" : "Child"}
            </button>
            <button
              onClick={() => deleteMember(activeMember.id)}
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 cursor-pointer"
              title={lang === "bn" ? "মুছুন" : "Delete"}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100">
              <Briefcase className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span className="font-semibold text-stone-800 truncate">
                {lang === "bn"
                  ? activeMember.professionBn
                  : activeMember.professionEn}
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100">
              <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="font-semibold text-stone-800 truncate">
                {lang === "bn"
                  ? activeMember.locationBn
                  : activeMember.locationEn}
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100">
              <Calendar className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span className="font-semibold text-stone-800">
                {activeMember.birthYear || "?"} —{" "}
                {activeMember.isAlive
                  ? lang === "bn"
                    ? "বর্তমান"
                    : "Now"
                  : activeMember.deathYear || "?"}
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50/60 border border-rose-100">
              <Droplets className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-bold text-rose-700">
                {activeMember.bloodGroup}
              </span>
            </div>

            {(activeMember.educationBn || activeMember.educationEn) && (
              <div className="col-span-2 flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100">
                <GraduationCap className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="font-semibold text-stone-800 truncate">
                  {lang === "bn"
                    ? activeMember.educationBn
                    : activeMember.educationEn}
                </span>
              </div>
            )}

            {(activeMember.spouseNameBn || activeMember.spouseNameEn) && (
              <div className="col-span-2 flex items-center gap-2.5 p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                <Heart className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span className="font-semibold text-stone-800 truncate">
                  {lang === "bn"
                    ? activeMember.spouseNameBn
                    : activeMember.spouseNameEn}
                </span>
              </div>
            )}

            {activeMember.phone && (
              <a
                href={`tel:${activeMember.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-950"
              >
                <Phone className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="truncate">{activeMember.phone}</span>
              </a>
            )}

            {activeMember.email && (
              <a
                href={`mailto:${activeMember.email}`}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100 font-semibold text-stone-800"
              >
                <Mail className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="truncate">{activeMember.email}</span>
              </a>
            )}
          </div>

          {/* Relatives Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-stone-100">
            <div>
              <p className="text-xs font-bold text-stone-500 mb-2">
                {lang === "bn" ? "পিতা" : "Parent"}
              </p>
              {parent ? (
                <button
                  onClick={() => setSelectedMember(parent)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-200 text-xs font-bold cursor-pointer"
                >
                  <span>{lang === "bn" ? parent.nameBn : parent.nameEn}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-xs text-stone-400">-</span>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-stone-500 mb-2">
                {lang === "bn" ? "সন্তান" : "Children"} ({children.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {children.length > 0 ? (
                  children.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedMember(c)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-950 border border-amber-200 text-xs font-bold cursor-pointer"
                    >
                      <span>{lang === "bn" ? c.nameBn : c.nameEn}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-stone-400">-</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-stone-500 mb-2">
                {lang === "bn" ? "ভাই-বোন" : "Siblings"} ({siblings.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {siblings.length > 0 ? (
                  siblings.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedMember(s)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-800 text-xs font-semibold cursor-pointer"
                    >
                      <span>{lang === "bn" ? s.nameBn : s.nameEn}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-stone-400">-</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
