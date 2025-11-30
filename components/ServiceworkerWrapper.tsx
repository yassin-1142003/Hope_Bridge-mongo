"use client";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Bell, Download, Share, Wifi, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function ServiceworkerWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [fullinstallwidget, setfullinstallwidget] = useState(false);

  const benefits = [
    { icon: Zap, text: "Instant access" },
    { icon: Wifi, text: "Works offline" },
    { icon: Bell, text: "Stay updated" },
  ];

  useEffect(() => {
    // Detect iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as NavigatorWithStandalone).standalone ||
      document.referrer.includes("android-app://");
    setIsStandalone(!!standalone);

    // Register Service Worker

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        console.log("✅ Service Worker registered:", reg.scope);
      })
      .catch((err) => console.error("❌ SW registration failed:", err));

    // Handle install prompt for Android/Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For iOS, show install prompt after a delay if not installed
    if (iOS && !standalone) {
      const hasSeenPrompt = localStorage.getItem("ios-install-prompt-seen");
      if (!hasSeenPrompt) {
        setTimeout(() => {
          setShowInstall(true);
        }, 3000); // Show after 3 seconds
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // For iOS, just show the instructions modal
      setfullinstallwidget(true);
      return;
    }

    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("Install outcome:", outcome);
    setDeferredPrompt(null);
    setShowInstall(false);
    setfullinstallwidget(false);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    setfullinstallwidget(false);
    if (isIOS) {
      localStorage.setItem("ios-install-prompt-seen", "true");
    }
  };

  // Don't show if already installed
  if (isStandalone) return <>{children}</>;

  return (
    <>
      {children}
      {showInstall && (
        <Button
          onClick={() => setfullinstallwidget(!fullinstallwidget)}
          className="fixed bottom-4 z-[9999] right-4 px-4 py-2 text-white rounded-xl shadow-md"
        >
          {isIOS ? " Add to Home" : "Install App"}
        </Button>
      )}
      <AnimatePresence>
        {fullinstallwidget && (
          <div>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
              onClick={handleDismiss}
            />

            {/* Modal */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[9999] bg-linear-to-br from-[#d84040] via-[#e05555] to-[#d84040] text-white rounded-t-3xl shadow-2xl max-w-2xl mx-auto"
            >
              <div className="p-6 relative">
                {/* Close */}
                <Button
                  onClick={handleDismiss}
                  className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/10 w-8 h-8 p-0"
                  variant="ghost"
                >
                  <X size={18} />
                </Button>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="flex justify-center mb-4"
                >
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    {isIOS ? (
                      <Share className="w-8 h-8 text-white" />
                    ) : (
                      <Download className="w-8 h-8 text-white" />
                    )}
                  </div>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold text-center mb-2"
                >
                  {isIOS ? "Add to Home Screen" : "Install Hope Bridge"}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/90 text-center text-sm mb-5"
                >
                  {isIOS
                    ? "Install this app for quick access and offline use"
                    : "Get quick access and a native app experience"}
                </motion.p>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-around mb-6 bg-white/10 rounded-xl p-3 backdrop-blur-sm"
                >
                  {benefits.map((b, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1 flex-1"
                    >
                      <b.icon className="w-5 h-5 text-white/90" />
                      <span className="text-xs text-white/80 text-center">
                        {b.text}
                      </span>
                    </div>
                  ))}
                </motion.div>

                {isIOS ? (
                  // iOS Instructions
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <ol className="space-y-3 text-sm">
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                            1
                          </span>
                          <span>
                            Tap the <Share className="inline w-4 h-4 mx-1" />{" "}
                            <strong>Share</strong> button below
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                            2
                          </span>
                          <span>
                            Scroll and tap{" "}
                            <strong>&quot;Add to Home Screen&quot;</strong>
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                            3
                          </span>
                          <span>
                            Tap <strong>&quot;Add&quot;</strong> in the top
                            right
                          </span>
                        </li>
                      </ol>
                    </div>

                    <Button
                      onClick={handleDismiss}
                      className="w-full bg-white text-[#d84040] hover:bg-white/90 font-semibold"
                    >
                      Got it!
                    </Button>
                  </div>
                ) : (
                  // Android/Chrome Install
                  <div className="flex w-full items-center flex-row justify-between gap-3">
                    <Button
                      onClick={handleInstallClick}
                      className="px-4 py-2 bg-white text-[#d84040] rounded-xl shadow-md hover:bg-white/90 font-semibold"
                    >
                      Install App
                    </Button>

                    <Button
                      onClick={handleDismiss}
                      variant="ghost"
                      className="text-white border border-white/30 hover:bg-white/10 font-semibold"
                    >
                      Later
                    </Button>
                  </div>
                )}

                {!isIOS && (
                  <p className="text-center text-xs text-white/60 mt-4">
                    Can&apos;t see install option? Try Menu (⋮) → Install app
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}
