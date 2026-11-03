"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { Users, Layers, GitBranch, HeartPulse } from "lucide-react";
import { useFamily } from "@/context/FamilyContext";
import Navbar from "@/components/Navbar";
import { useKeyboardOpen } from "@/hooks/useKeyboardOpen";

// Dynamically import heavy modals to reduce initial load bundle size
const MemberProfileModal = dynamic(() => import("@/components/MemberProfileModal"), { ssr: false });
const MemberFormModal = dynamic(() => import("@/components/MemberFormModal"), { ssr: false });
const AdminDeleteModal = dynamic(() => import("@/components/AdminDeleteModal"), { ssr: false });
const BirthdayCelebrationModal = dynamic(() => import("@/components/BirthdayCelebrationModal"), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isBdayDismissed, setIsBdayDismissed] = useState(true);

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
    todayBirthdays,
  } = useFamily();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const todayStr = new Date().toISOString().slice(0, 10);
    const dismissed = sessionStorage.getItem(`bongsho_bday_modal_dismissed_${todayStr}`);
    if (!dismissed) {
      setIsBdayDismissed(false);
    }
  }, []);

  const handleDismissBday = () => {
    setIsBdayDismissed(true);
    if (typeof window !== "undefined") {
      const todayStr = new Date().toISOString().slice(0, 10);
      sessionStorage.setItem(`bongsho_bday_modal_dismissed_${todayStr}`, "true");
    }
  };

  const handleSendBdayWish = (m: (typeof members)[0]) => {
    handleDismissBday();
    const name = lang === "bn" ? m.nameBn : m.nameEn;
    const wishText = lang === "bn"
      ? `🎂 শুভ জন্মদিন ${name}! আপনার সুস্বাস্থ্য ও দীর্ঘায়ু কামনা করি। 🎉`
      : `🎂 Happy Birthday ${name}! Wishing you good health and prosperity. 🎉`;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bongsho_prefill_chat_text", wishText);
    }
    router.push("/chat");
  };

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

  const isChatPage =
    pathname === "/chat" ||
    pathname === "/chat/" ||
    pathname === "/bongsho-brikkho/chat" ||
    pathname === "/bongsho-brikkho/chat/";

  const isKeyboardOpen = useKeyboardOpen();

  return (
    <div
      className={`flex flex-col bg-[#f8f7f4] ${
        isChatPage
          ? isKeyboardOpen
            ? "h-[100dvh] overflow-hidden pb-0 md:pb-0"
            : "h-[100dvh] overflow-hidden pb-14 md:pb-0"
          : "min-h-screen pb-20 md:pb-0"
      }`}
      style={
        isChatPage && isKeyboardOpen && typeof window !== "undefined" && window.visualViewport
          ? { height: `${window.visualViewport.height}px` }
          : undefined
      }
    >
      <Navbar />

      {/* Single-Word Stats Strip: Only shown on main Family Tree page. */}
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

      {/* Page Content: Full-bleed edge-to-edge for Chat, standard container for other pages */}
      <main
        className={
          isChatPage
            ? "flex-1 w-full flex flex-col min-h-0 overflow-hidden p-0 m-0 max-w-none"
            : "flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6"
        }
      >
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

      {/* Birthday Celebration Modal */}
      {!isBdayDismissed && todayBirthdays.length > 0 && (
        <BirthdayCelebrationModal
          todayBirthdays={todayBirthdays}
          lang={lang}
          onClose={handleDismissBday}
          onSendWish={handleSendBdayWish}
        />
      )}
    </div>
  );
}
