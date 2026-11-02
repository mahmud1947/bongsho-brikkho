"use client";

import React, { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { UserProfile } from "@/types/family";
import ProfileAuthCard from "@/components/profile/ProfileAuthCard";
import ProfileViewCard from "@/components/profile/ProfileViewCard";
import ProfileEditForm from "@/components/profile/ProfileEditForm";

export default function ProfilePage() {
  const {
    lang,
    currentUsername,
    currentUserProfile,
    loginUsername,
    loginByIdentifier,
    checkAccountExists,
    logoutUsername,
    saveUserProfile,
  } = useFamily();

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 1. Not Logged In State -> Show Login & Sign-up Auth Card
  if (!currentUsername) {
    return (
      <ProfileAuthCard
        lang={lang}
        loginByIdentifier={loginByIdentifier}
        checkAccountExists={checkAccountExists}
        saveUserProfile={saveUserProfile}
        loginUsername={loginUsername}
      />
    );
  }

  // 2. Logged in, but Account Not Created Yet OR currently editing
  const isNewAccount = !currentUserProfile;

  if (isNewAccount || isEditing) {
    return (
      <ProfileEditForm
        lang={lang}
        currentUsername={currentUsername}
        currentUserProfile={currentUserProfile}
        onSave={async (profileData: UserProfile) => {
          await saveUserProfile(profileData);
          setSaveSuccess(true);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
        onLogout={logoutUsername}
      />
    );
  }

  // 3. Logged In & Active Profile View
  return (
    <ProfileViewCard
      lang={lang}
      currentUserProfile={currentUserProfile}
      saveSuccess={saveSuccess}
      onDismissSaveSuccess={() => setSaveSuccess(false)}
      onStartEditing={() => setIsEditing(true)}
      onLogout={logoutUsername}
    />
  );
}
