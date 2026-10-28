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
  } = useFamily();

  return (
    <HeritageAndGallery
      timeline={timeline}
      gallery={gallery}
      lang={lang}
      onAddTimelineEvent={addTimelineEvent}
      onDeleteTimelineEvent={deleteTimelineEvent}
      onAddGalleryItem={addGalleryItem}
      onDeleteGalleryItem={deleteGalleryItem}
    />
  );
}
