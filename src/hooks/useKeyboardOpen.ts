"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect when the software keyboard (Android/iOS) is open.
 * Uses window.visualViewport resize and input focus tracking to provide
 * accurate, glitch-free keyboard state.
 */
export function useKeyboardOpen(): boolean {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkKeyboard = () => {
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl instanceof HTMLElement && activeEl.isContentEditable);

      if (!isInputActive) {
        setIsKeyboardOpen(false);
        return;
      }

      if (window.visualViewport) {
        const heightDiff = window.innerHeight - window.visualViewport.height;
        setIsKeyboardOpen(heightDiff > 60 || isInputActive);
      } else {
        setIsKeyboardOpen(true);
      }
    };

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", checkKeyboard);
      vv.addEventListener("scroll", checkKeyboard);
    } else {
      window.addEventListener("resize", checkKeyboard);
    }

    const handleFocusIn = () => {
      setTimeout(checkKeyboard, 50);
      setTimeout(checkKeyboard, 200);
      setTimeout(checkKeyboard, 400);
    };

    const handleFocusOut = () => {
      setTimeout(checkKeyboard, 100);
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      if (vv) {
        vv.removeEventListener("resize", checkKeyboard);
        vv.removeEventListener("scroll", checkKeyboard);
      } else {
        window.removeEventListener("resize", checkKeyboard);
      }
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return isKeyboardOpen;
}

