"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useFamily } from "@/context/FamilyContext";
import FamilyTreeView from "@/components/FamilyTreeView";

export default function TreePage() {
  const router = useRouter();
  const { members, branches, lang, setSelectedMember, openAddModal } = useFamily();

  return (
    <FamilyTreeView
      members={members}
      branches={branches}
      lang={lang}
      onSelectMember={(m) => {
        setSelectedMember(m);
        router.push("/profile");
      }}
      onAddChildToMember={(parent) => openAddModal(parent)}
    />
  );
}
