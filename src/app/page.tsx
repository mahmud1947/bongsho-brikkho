"use client";

import React from "react";
import { useFamily } from "@/context/FamilyContext";
import FamilyTreeView from "@/components/FamilyTreeView";

export default function TreePage() {
  const { members, branches, lang, setSelectedMember, openAddModal } = useFamily();

  return (
    <FamilyTreeView
      members={members}
      branches={branches}
      lang={lang}
      onSelectMember={(m) => setSelectedMember(m)}
      onAddChildToMember={(parent) => openAddModal(parent)}
    />
  );
}
