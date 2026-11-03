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

      if (window.visualViewport) {
        const heightDiff = window.innerHeight - window.visualViewport.height;
        // On Android/iOS, keyboards take up 200px - 400px of vertical space
        if (heightDiff > 130) {
          setIsKeyboardOpen(true);
          return;
        }
        if (isInputActive && heightDiff > 60) {
          setIsKeyboardOpen(true);
          return;
        }
        if (!isInputActive || heightDiff < 50) {
          setIsKeyboardOpen(false);
          return;
        }
      } else {
        setIsKeyboardOpen(isInputActive);
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
