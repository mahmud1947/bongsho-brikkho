"use client";

import React from "react";
import FamilyChat from "@/components/FamilyChat";
import { useFamily } from "@/context/FamilyContext";

export default function ChatPage() {
  const { chatMessages, lang, currentUsername, currentUserProfile, isAdmin, sendChatMessage, deleteChatMessage, openDeletePrompt } = useFamily();
  return <FamilyChat messages={chatMessages} lang={lang} currentUsername={currentUsername} currentUserProfile={currentUserProfile} isAdmin={isAdmin} onSend={sendChatMessage} onDelete={(id) => openDeletePrompt({ title: lang === "bn" ? "বার্তা মুছুন" : "Delete Message", onConfirm: () => deleteChatMessage(id) })} />;
}
