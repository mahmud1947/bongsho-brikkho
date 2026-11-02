"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserPresence, UserProfile } from "@/types/family";

function cleanData<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

export function usePresenceTracker(
  currentUsername: string | null,
  currentUserProfile: UserProfile | null
) {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const currentUsernameRef = useRef<string | null>(currentUsername);

  useEffect(() => {
    currentUsernameRef.current = currentUsername;
  }, [currentUsername]);

  // Real-time Firestore subscription to user_presence
  useEffect(() => {
    const unsubPresence = onSnapshot(collection(db, "user_presence"), (snap) => {
      const now = Date.now();
      const list: UserPresence[] = [];
      const seen = new Set<string>();

      snap.docs.forEach((d) => {
        const data = d.data() as UserPresence;
        if (!data.username || seen.has(data.username)) return;
        seen.add(data.username);

        const lastSeenTime = new Date(data.lastSeen).getTime();
        const isRecent = !isNaN(lastSeenTime) && now - lastSeenTime < 80000;
        if (data.isOnline && isRecent) {
          list.push(data);
        }
      });

      const me = currentUsernameRef.current;
      if (me && !seen.has(me)) {
        list.push({
          username: me,
          displayName: me,
          lastSeen: new Date().toISOString(),
          isOnline: true,
        });
      }

      setOnlineUsers(list);
      setOnlineCount(Math.max(1, list.length));
    });

    return () => unsubPresence();
  }, []);

  // Heartbeat sender
  const updatePresenceHeartbeat = useCallback(
    async (isOnline: boolean = true) => {
      const user = currentUsernameRef.current;
      if (!user) return;
      try {
        const profile = currentUserProfile;
        const name = profile?.nameBn || profile?.nameEn || `@${user}`;
        const isMobile =
          typeof navigator !== "undefined" &&
          /android|iphone|ipad|mobile/i.test(navigator.userAgent);
        const presenceData: UserPresence = {
          username: user,
          displayName: name,
          photoUrl: profile?.photoUrl || "",
          lastSeen: new Date().toISOString(),
          isOnline,
          platform: isMobile ? "mobile" : "desktop",
        };
        await setDoc(doc(db, "user_presence", user), cleanData(presenceData), { merge: true });
      } catch (err) {
        // silently catch offline/presence network error
      }
    },
    [currentUserProfile]
  );

  useEffect(() => {
    if (!currentUsername) return;

    updatePresenceHeartbeat(true);

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        updatePresenceHeartbeat(true);
      }
    }, 32000);

    const handleVisibilityChange = () => {
      if (typeof document !== "undefined") {
        if (document.visibilityState === "visible") {
          updatePresenceHeartbeat(true);
        } else {
          updatePresenceHeartbeat(false);
        }
      }
    };

    const handleBeforeUnload = () => {
      updatePresenceHeartbeat(false);
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentUsername, updatePresenceHeartbeat]);

  return {
    onlineUsers,
    onlineCount,
    updatePresenceHeartbeat,
  };
}

