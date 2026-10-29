"use client";

import React from "react";
import { useFamily } from "@/context/FamilyContext";
import NoticeBoard from "@/components/NoticeBoard";

export default function NoticesPage() {
  const { notices, lang, addNotice, deleteNotice, openDeletePrompt } = useFamily();

  return (
    <NoticeBoard
      notices={notices}
      lang={lang}
      onAddNotice={addNotice}
      onDeleteNotice={(id) => {
        const item = notices.find((x) => x.id === id);
        openDeletePrompt({
          title: lang === "bn" ? "নোটিশ মুছুন" : "Delete Notice",
          itemName: item ? (lang === "bn" ? item.titleBn : item.titleEn) : undefined,
          onConfirm: () => deleteNotice(id),
        });
      }}
    />
  );
}
