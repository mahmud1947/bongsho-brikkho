"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone, Share, PlusSquare } from "lucide-react";

export default function PwaRegistration() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (already installed)
    const isApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isApp);

    if (isApp) return;

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        // Resolve basePath dynamically (e.g., /bongsho-brikkho or /)
        const basePath = window.location.pathname.startsWith("/bongsho-brikkho")
          ? "/bongsho-brikkho"
          : "";
        const swUrl = `${basePath}/sw.js`;

        navigator.serviceWorker
          .register(swUrl, { scope: `${basePath}/` })
          .then((reg) => {
            console.log("[PWA] Service Worker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      });
    }

    // Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user dismissed banner recently
      const dismissed = sessionStorage.getItem("pwa_install_dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Detect successful install
    window.addEventListener("appinstalled", () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      console.log("[PWA] App installed successfully!");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowInstallBanner(false);
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Discreet floating Install Banner for Android/Desktop */}
      {showInstallBanner && deferredPrompt && (
        <div className="fixed bottom-20 md:bottom-4 right-4 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-auto bg-emerald-950 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-700/80 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-extrabold flex-shrink-0 shadow">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold truncate text-white">
                অ্যাপ ইনস্টল করুন
              </h4>
              <p className="text-[11px] text-emerald-200 truncate">
                হোমস্ক্রিন থেকে সরাসরি ব্যবহার করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold shadow transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ইনস্টল</span>
            </button>
            <button
              onClick={dismissBanner}
              className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
                <Smartphone className="w-5 h-5 text-emerald-700" />
                <span>iPhone / iPad এ ইনস্টল করুন</span>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-stone-700">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  ১
                </span>
                <p>
                  Safari ব্রাউজারের নিচে থাকা{" "}
                  <strong className="inline-flex items-center gap-1 text-emerald-800">
                    <Share className="w-3.5 h-3.5 inline" /> Share (শেয়ার)
                  </strong>{" "}
                  আইকনে ট্যাপ করুন।
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  ২
                </span>
                <p>
                  তালিকা থেকে স্ক্রোল করে{" "}
                  <strong className="inline-flex items-center gap-1 text-emerald-800">
                    <PlusSquare className="w-3.5 h-3.5 inline" /> Add to Home Screen (হোম স্ক্রিনে যোগ করুন)
                  </strong>{" "}
                  সিলেক্ট করুন।
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  ৩
                </span>
                <p>
                  উপরে ডানে <strong>Add</strong> বাটনে চাপ দিন। আপনার ফোনে অ্যাপ আইকন যুক্ত হয়ে যাবে!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-xs shadow"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </>
  );
}

