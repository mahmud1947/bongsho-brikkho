"use client";

import React from "react";
import { useFamily } from "@/context/FamilyContext";
import MemberDirectory from "@/components/MemberDirectory";

export default function DirectoryPage() {
  const { members, branches, lang, setSelectedMember, openAddModal } = useFamily();

  return (
    <MemberDirectory
      members={members}
      branches={branches}
      lang={lang}
      onSelectMember={(m) => setSelectedMember(m)}
      onAddMember={() => openAddModal(null)}
    />
  );
}
