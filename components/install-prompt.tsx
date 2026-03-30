"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function getIsIOS() {
  return typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function getIsStandalone() {
  return typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;
}

// NOTE: shows an install-to-home-screen prompt.
// - On Chrome/Edge: captures the `beforeinstallprompt` event and shows a native install button.
// - On iOS Safari: shows manual instructions (iOS doesn't support `beforeinstallprompt`).
// - Hidden when the app is already installed (standalone mode).

// Usage:
// ```tsx
// <InstallPrompt />
// ```

export function InstallPrompt() {
  const isIOS = useSyncExternalStore(
    () => () => {},
    getIsIOS,
    () => false,
  );
  const isStandalone = useSyncExternalStore(
    () => () => {},
    getIsStandalone,
    () => false,
  );
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }

  // NOTE: already installed or no install path available
  if (isStandalone) return null;
  if (!isIOS && !deferredPrompt) return null;

  return (
    <div className="text-muted-foreground text-sm">
      {deferredPrompt && (
        <button onClick={handleInstall} className="hover:text-foreground underline underline-offset-4 transition-colors">
          Install app
        </button>
      )}
      {isIOS && !deferredPrompt && (
        <p>
          Tap the share button <span aria-label="share icon">&#x2B06;</span> then &ldquo;Add to Home Screen&rdquo; to install.
        </p>
      )}
    </div>
  );
}

// NOTE: Chrome's BeforeInstallPromptEvent is not in the standard lib types
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
