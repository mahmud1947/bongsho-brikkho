"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Users, Layers, GitBranch, HeartPulse } from "lucide-react";
import { useFamily } from "@/context/FamilyContext";
import Navbar from "@/components/Navbar";
import MemberProfileModal from "@/components/MemberProfileModal";
import MemberFormModal from "@/components/MemberFormModal";
import AdminDeleteModal from "@/components/AdminDeleteModal";

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
    isAdmin,
    loginAdmin,
    deletePrompt,
    openDeletePrompt,
    closeDeletePrompt,
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

  const pathname = usePathname();
  const isTreePage =
    pathname === "/" ||
    pathname === "" ||
    pathname === "/bongsho-brikkho" ||
    pathname === "/bongsho-brikkho/";

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f7f4] pb-20 md:pb-0">
      <Navbar />

      {/* Single-Word Stats Strip: Only shown on main Family Tree page, hidden on Profile / Members / History / Notices */}
      {isTreePage && (
        <section className="bg-emerald-900 text-white border-b border-emerald-800">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
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
            </div>
          </div>
        </section>
      )}

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
        {children}
      </main>

      <MemberProfileModal
        member={selectedMember}
        allMembers={members}
        branches={branches}
        lang={lang}
        onClose={() => setSelectedMember(null)}
        onSelectMember={(m) => setSelectedMember(m)}
        onEditMember={(m) => openEditModal(m)}
        onAddChild={(parent) => openAddModal(parent)}
        onDeleteMember={(id) => {
          const m = members.find((x) => x.id === id);
          const memberName = m ? (lang === "bn" ? m.nameBn : m.nameEn) : undefined;
          openDeletePrompt({
            title: lang === "bn" ? "সদস্য মুছে ফেলুন" : "Delete Member",
            itemName: memberName,
            onConfirm: async () => {
              await deleteMember(id);
              setSelectedMember(null);
            },
          });
        }}
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

      {deletePrompt && (
        <AdminDeleteModal
          isOpen={deletePrompt.isOpen}
          title={deletePrompt.title}
          itemName={deletePrompt.itemName}
          isAdmin={isAdmin}
          lang={lang}
          onClose={closeDeletePrompt}
          onConfirm={deletePrompt.onConfirm}
          onLoginAdmin={loginAdmin}
        />
      )}
    </div>
  );
}
