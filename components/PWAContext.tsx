"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { UseNetworkstatus } from "./UseNetworkstatus";
import OfflinePage from "@/app/[locale]/offline/page";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type PWAContextType = {
  isStandalone: boolean;
  isIOS: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  triggerInstall: () => Promise<void>;
};

const PWAContext = createContext<PWAContextType | null>(null);

export function usePWA() {
  return useContext(PWAContext);
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
    );

    // Detect standalone mode
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        ((navigator as Navigator & { standalone?: boolean }).standalone ??
          false)
    );

    // Catch install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };
  const { isOnline } = UseNetworkstatus();
  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <PWAContext.Provider
      value={{ isIOS, isStandalone, deferredPrompt, triggerInstall }}
    >
      {children}
    </PWAContext.Provider>
  );
}
