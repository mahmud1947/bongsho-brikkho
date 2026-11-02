/**
 * Browser Notification & Sound Utilities for Family Chat
 * 100% Free, Zero-dependency, Mobile & Offline-compatible
 */

// Shared AudioContext for cross-platform audio playback
let sharedAudioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

// Unlock AudioContext on mobile devices upon first user interaction
export function unlockAudioContext() {
  if (typeof window === "undefined" || isAudioUnlocked) return;

  const unlock = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!sharedAudioCtx) {
        sharedAudioCtx = new AudioCtx();
      }
      if (sharedAudioCtx.state === "suspended") {
        sharedAudioCtx.resume();
      }
      isAudioUnlocked = true;
    } catch {}

    window.removeEventListener("touchstart", unlock);
    window.removeEventListener("touchend", unlock);
    window.removeEventListener("click", unlock);
    window.removeEventListener("keydown", unlock);
  };

  window.addEventListener("touchstart", unlock, { passive: true });
  window.addEventListener("touchend", unlock, { passive: true });
  window.addEventListener("click", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
}

// Auto-register audio unlocker in browser
if (typeof window !== "undefined") {
  unlockAudioContext();
}

// Synthesize a crisp, pleasant notification chime using Web Audio API
export function playNotificationChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }

    const ctx = sharedAudioCtx;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    // Two-tone pleasant chord chime (A5 -> E6)
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.51, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.2);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);
  } catch {
    // Audio autoplay restrictions or unsupported
  }
}

// Vibrate mobile device
export function vibrateDevice(pattern: number[] = [140, 70, 140]) {
  if (typeof window === "undefined" || !("navigator" in window)) return;
  try {
    if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch {
    // Vibrate ignored
  }
}

// Check current notification permission
export function getNotificationPermission(): "granted" | "denied" | "default" | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

// Request permission from the user
export async function requestChatNotificationPermission(): Promise<"granted" | "denied" | "default" | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  try {
    const res = await Notification.requestPermission();
    // If granted, unlock audio context immediately
    if (res === "granted") {
      playNotificationChime();
      vibrateDevice([60]);
    }
    return res;
  } catch {
    return "denied";
  }
}

// Show native OS notification (Optimized for Android Chrome, PWA & Desktop)
export async function showBrowserNotification(
  title: string,
  options: {
    body: string;
    icon?: string;
    tag?: string;
    data?: any;
  }
) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const origin = window.location.origin;
  const basePath = window.location.pathname.startsWith("/bongsho-brikkho") ? "/bongsho-brikkho" : "";
  const iconUrl = options.icon
    ? (options.icon.startsWith("http") ? options.icon : `${origin}${options.icon}`)
    : `${origin}${basePath}/icons/icon-192x192.png`;

  const notificationOptions = {
    body: options.body,
    icon: iconUrl,
    badge: iconUrl,
    tag: options.tag || "bongsho-chat-new",
    renotify: true,
    vibrate: [140, 70, 140],
    data: {
      url: `${basePath}/chat`,
      ...(options.data || {}),
    },
  };

  // 1. Try Service Worker showNotification FIRST (Required on Android / Mobile Chrome)
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && typeof reg.showNotification === "function") {
        await reg.showNotification(title, notificationOptions);
        return;
      }
    } catch (swErr) {
      // SW notification fallback
    }
  }

  // 2. Desktop fallback (Window Notification constructor)
  try {
    const notif = new Notification(title, {
      body: options.body,
      icon: iconUrl,
      badge: iconUrl,
      tag: options.tag || "bongsho-chat-new",
      data: options.data,
    });

    notif.onclick = () => {
      window.focus();
      const current = window.location.pathname;
      if (!current.includes("/chat")) {
        window.location.href = `${basePath}/chat`;
      }
      notif.close();
    };
  } catch {
    // Suppress illegal constructor error on mobile if SW already fired
  }
}
