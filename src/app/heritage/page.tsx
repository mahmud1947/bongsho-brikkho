"use client";

import React from "react";
import { useFamily } from "@/context/FamilyContext";
import HeritageAndGallery from "@/components/HeritageAndGallery";

export default function HeritagePage() {
  const {
    timeline,
    gallery,
    lang,
    addTimelineEvent,
    deleteTimelineEvent,
    addGalleryItem,
    deleteGalleryItem,
    openDeletePrompt,
  } = useFamily();

  return (
    <HeritageAndGallery
      timeline={timeline}
      gallery={gallery}
      lang={lang}
      onAddTimelineEvent={addTimelineEvent}
      onDeleteTimelineEvent={(id) => {
        const item = timeline.find((x) => x.id === id);
        openDeletePrompt({
          title: lang === "bn" ? "ইতিহাসের ঘটনা মুছুন" : "Delete Event",
          itemName: item ? (lang === "bn" ? item.titleBn : item.titleEn) : undefined,
          onConfirm: () => deleteTimelineEvent(id),
        });
      }}
      onAddGalleryItem={addGalleryItem}
      onDeleteGalleryItem={(id) => {
        const item = gallery.find((x) => x.id === id);
        openDeletePrompt({
          title: lang === "bn" ? "ছবি মুছুন" : "Delete Photo",
          itemName: item ? (lang === "bn" ? item.titleBn : item.titleEn) : undefined,
          onConfirm: () => deleteGalleryItem(id),
        });
      }}
    />
  );
}
