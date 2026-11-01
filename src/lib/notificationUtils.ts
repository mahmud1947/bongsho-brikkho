/**
 * Browser Notification & Sound Utilities for Family Chat
 * 100% Free, Zero-dependency, Offline-compatible
 */

// Synthesize a crisp, pleasant notification chime using Web Audio API
export function playNotificationChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
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

    gain.gain.setValueAtTime(0.18, now);
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
    return res;
  } catch {
    return "denied";
  }
}

// Show native OS notification
export function showBrowserNotification(
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

  try {
    const basePath = window.location.pathname.startsWith("/bongsho-brikkho") ? "/bongsho-brikkho" : "";
    const iconUrl = options.icon || `${basePath}/icons/icon-192x192.png`;

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
    // Fallback if Notification constructor fails (e.g. mobile chrome requires service worker showNotification)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        const basePath = window.location.pathname.startsWith("/bongsho-brikkho") ? "/bongsho-brikkho" : "";
        const iconUrl = options.icon || `${basePath}/icons/icon-192x192.png`;
        reg.showNotification(title, {
          body: options.body,
          icon: iconUrl,
          badge: iconUrl,
          tag: options.tag || "bongsho-chat-new",
          data: { url: `${basePath}/chat` },
        });
      }).catch(() => {});
    }
  }
}
