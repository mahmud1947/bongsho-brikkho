"use client";

import React from "react";
import { useFamily } from "@/context/FamilyContext";
import NoticeBoard from "@/components/NoticeBoard";

export default function NoticesPage() {
  const { notices, lang, addNotice, deleteNotice } = useFamily();

  return (
    <NoticeBoard
      notices={notices}
      lang={lang}
      onAddNotice={addNotice}
      onDeleteNotice={deleteNotice}
    />
  );
}
