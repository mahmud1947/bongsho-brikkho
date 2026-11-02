"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useFamily } from "@/context/FamilyContext";
import MemberDirectory from "@/components/MemberDirectory";

export default function DirectoryPage() {
  const router = useRouter();
  const {
    members,
    branches,
    lang,
    setSelectedMember,
    openAddModal,
    upcomingBirthdays,
  } = useFamily();

  const handleSendWish = (m: (typeof members)[0]) => {
    const name = lang === "bn" ? m.nameBn : m.nameEn;
    const wishText =
      lang === "bn"
        ? `🎂 শুভ জন্মদিন ${name}! আপনার সুস্বাস্থ্য ও দীর্ঘায়ু কামনা করি। 🎉`
        : `🎂 Happy Birthday ${name}! Wishing you good health and prosperity. 🎉`;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bongsho_prefill_chat_text", wishText);
    }
    router.push("/chat");
  };

  return (
    <MemberDirectory
      members={members}
      branches={branches}
      lang={lang}
      onSelectMember={(m) => setSelectedMember(m)}
      onAddMember={() => openAddModal(null)}
      upcomingBirthdays={upcomingBirthdays}
      onSendWish={handleSendWish}
    />
  );
}
