"use client";

import React, { useEffect } from "react";
import FamilyChat from "@/components/FamilyChat";
import { useFamily } from "@/context/FamilyContext";

export default function ChatPage() {
  const {
    chatMessages,
    members,
    lang,
    currentUsername,
    currentUserProfile,
    isAdmin,
    loginUsername,
    saveUserProfile,
    sendChatMessage,
    deleteChatMessage,
    openDeletePrompt,
    markChatAsRead,
    onlineCount,
    onlineUsers,
    groupSettings,
    updateGroupSettings,
    typingUsers,
    setTypingStatus,
    setSelectedMember,
  } = useFamily();

  useEffect(() => {
    markChatAsRead();
  }, [markChatAsRead, chatMessages.length]);

  return (
    <div className="w-full h-full flex flex-col min-h-0 flex-1 overflow-hidden">
      <FamilyChat
        messages={chatMessages}
        members={members}
        lang={lang}
        currentUsername={currentUsername}
        currentUserProfile={currentUserProfile}
        isAdmin={isAdmin}
        onlineCount={onlineCount}
        onlineUsers={onlineUsers}
        groupSettings={groupSettings}
        onUpdateGroupSettings={updateGroupSettings}
        typingUsers={typingUsers}
        onTypingChange={setTypingStatus}
        onSelectMemberProfile={(m) => setSelectedMember(m)}
        onMarkRead={markChatAsRead}
        onSend={sendChatMessage}
        onUpdate={sendChatMessage}
        onDeleteOwn={deleteChatMessage}
        onDeleteAdmin={(id) =>
          openDeletePrompt({
            title: lang === "bn" ? "বার্তা মুছুন" : "Delete Message",
            onConfirm: () => deleteChatMessage(id),
          })
        }
        onQuickLogin={async (username, displayName) => {
          const cleanUser = username.trim().toLowerCase().replace(/^@/, "");
          if (!cleanUser) return;
          loginUsername(cleanUser);
          if (displayName.trim()) {
            await saveUserProfile({
              username: cleanUser,
              nameBn: displayName.trim(),
              nameEn: displayName.trim(),
              gender: "male",
              updatedAt: new Date().toISOString(),
            });
          }
        }}
      />
    </div>
  );
}
