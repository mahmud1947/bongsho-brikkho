"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Users, Layers, GitBranch, HeartPulse, TreePine } from "lucide-react";
import { useFamily } from "@/context/FamilyContext";
import Navbar from "@/components/Navbar";
import MemberProfileModal from "@/components/MemberProfileModal";
import MemberFormModal from "@/components/MemberFormModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const {
    lang,
    members,
    branches,
    selectedMember,
    setSelectedMember,
    isFormOpen,
    setIsFormOpen,
    editingMember,
    defaultParentForAdd,
    openAddModal,
    openEditModal,
    saveMember,
    deleteMember,
  } = useFamily();

  const stats = useMemo(() => {
    const generations = new Set(members.map((m) => m.generation)).size;
    const activeBranches = new Set(
      members.filter((m) => m.branchId !== "root").map((m) => m.branchId)
    ).size;
    const donors = members.filter(
      (m) => m.isAlive && m.bloodGroup !== "Unknown"
    ).length;
    return {
      total: members.length,
      generations,
      branches: activeBranches,
      donors,
    };
  }, [members]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f7f4] pb-20 md:pb-0">
      <Navbar />

      {/* Compact Single-Word Stats Strip */}
      <section className="bg-emerald-900 text-white border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-emerald-950/50 border border-emerald-700/60 rounded-xl px-3 py-1.5 flex items-center justify-between">
              <span className="text-[11px] sm:text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 hidden sm:inline" />
                {lang === "bn" ? "সদস্য" : "Members"}
              </span>
              <span className="text-sm sm:text-lg font-extrabold">
                {stats.total}
              </span>
            </div>

            <div className="bg-emerald-950/50 border border-emerald-700/60 rounded-xl px-3 py-1.5 flex items-center justify-between">
              <span className="text-[11px] sm:text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 hidden sm:inline" />
                {lang === "bn" ? "প্রজন্ম" : "Gen"}
              </span>
              <span className="text-sm sm:text-lg font-extrabold">
                {stats.generations}
              </span>
            </div>

            <div className="bg-emerald-950/50 border border-emerald-700/60 rounded-xl px-3 py-1.5 flex items-center justify-between">
              <span className="text-[11px] sm:text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 hidden sm:inline" />
                {lang === "bn" ? "শাখা" : "Branches"}
              </span>
              <span className="text-sm sm:text-lg font-extrabold">
                {stats.branches}
              </span>
            </div>

            <div className="bg-emerald-950/50 border border-emerald-700/60 rounded-xl px-3 py-1.5 flex items-center justify-between">
              <span className="text-[11px] sm:text-xs text-rose-300 font-semibold flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 hidden sm:inline" />
                {lang === "bn" ? "রক্তদাতা" : "Donors"}
              </span>
              <span className="text-sm sm:text-lg font-extrabold">
                {stats.donors}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
        {children}
      </main>

      {/* Simple Footer with Individual Page Links */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-stone-200">
              {lang === "bn" ? "বংশবৃক্ষ" : "Bongsho Brikkho"}
            </span>
          </div>
          <div className="flex items-center gap-4 font-semibold">
            <Link href="/" className="hover:text-amber-300">
              {lang === "bn" ? "বৃক্ষ" : "Tree"}
            </Link>
            <Link href="/directory" className="hover:text-amber-300">
              {lang === "bn" ? "সদস্য" : "Members"}
            </Link>
            <Link href="/heritage" className="hover:text-amber-300">
              {lang === "bn" ? "ইতিহাস" : "History"}
            </Link>
            <Link href="/notices" className="hover:text-amber-300">
              {lang === "bn" ? "নোটিশ" : "Notices"}
            </Link>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <MemberProfileModal
        member={selectedMember}
        allMembers={members}
        branches={branches}
        lang={lang}
        onClose={() => setSelectedMember(null)}
        onSelectMember={(m) => setSelectedMember(m)}
        onEditMember={(m) => openEditModal(m)}
        onAddChild={(parent) => openAddModal(parent)}
        onDeleteMember={(id) => deleteMember(id)}
      />

      <MemberFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={saveMember}
        existingMembers={members}
        branches={branches}
        lang={lang}
        editingMember={editingMember}
        defaultParent={defaultParentForAdd}
      />
    </div>
  );
}
