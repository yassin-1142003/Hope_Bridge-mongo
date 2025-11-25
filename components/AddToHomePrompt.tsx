"use client";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "./ui/button";
import { X, Download, Smartphone, Zap, Wifi, Bell, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export interface AddToHomePromptRef {
  showPrompt: () => void;
  canInstall: boolean;
}

const AddToHomePrompt = forwardRef<AddToHomePromptRef>((_, ref) => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);
    if (standalone) return;

    // Check if user dismissed recently (within 10 hours) - only for auto-show
    const dismissedTime = localStorage.getItem("pwa-dismissed");
    let shouldAutoShow = true;
    if (dismissedTime) {
      const hoursSinceDismissed =
        (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 10) shouldAutoShow = false;
    }

    // Detect device
    const ua = navigator.userAgent;
    const iOS = /iPhone|iPad|iPod/i.test(ua);
    setIsIOS(iOS);

    // Only show on mobile
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    if (!isMobile) return;

    const handler = (e: Event) => {
      e.preventDefault();
      console.log("✅ beforeinstallprompt fired");
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Auto-show only if not dismissed recently
      if (shouldAutoShow) {
        const showTimer = setTimeout(() => {
          if (!dismissed) setShow(true);
        }, 3000);
        return () => clearTimeout(showTimer);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, show after engagement (only if not dismissed)
    if (iOS && shouldAutoShow) {
      const showTimer = setTimeout(() => {
        if (!dismissed) setShow(true);
      }, 5000);
      return () => clearTimeout(showTimer);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed]);

  // Expose method to manually trigger the prompt

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User ${outcome} the installation`);

      if (outcome === "accepted") {
        localStorage.removeItem("pwa-dismissed");
      }

      setShow(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Installation error:", error);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("pwa-dismissed", Date.now().toString());
  };

  const benefits = [
    { icon: Zap, text: "Instant access" },
    { icon: Wifi, text: "Works offline" },
    { icon: Bell, text: "Push notifications" },
  ];

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-gradient-to-br from-[#d84040] via-[#e05555] to-[#d84040] text-white rounded-t-3xl shadow-2xl max-w-2xl mx-auto"
          >
            <div className="p-6 relative">
              {/* Close Button */}
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
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-center mb-2"
              >
                Install Hope Bridge
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/90 text-center text-sm mb-5"
              >
                Get quick access and a native app experience
              </motion.p>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-around mb-6 bg-white/10 rounded-xl p-3 backdrop-blur-sm"
              >
                {benefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 flex-1"
                  >
                    <benefit.icon className="w-5 h-5 text-white/90" />
                    <span className="text-xs text-white/80 text-center">
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* iOS Instructions */}
              {isIOS && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm border border-white/20"
                >
                  <div className="flex items-start gap-3">
                    <Share className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-2">
                        How to install on iOS:
                      </p>
                      <ol className="text-xs text-white/90 space-y-1.5">
                        <li>
                          1. Tap the <strong>Share</strong> button (⬆️) below
                        </li>
                        <li>
                          2. Scroll and select{" "}
                          <strong>Add to Home Screen</strong>
                        </li>
                        <li>
                          3. Tap <strong>Add</strong>
                        </li>
                      </ol>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Android Ready */}
              {!isIOS && deferredPrompt && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-green-500/20 border border-green-400/30 rounded-xl p-3 mb-4 flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-green-300" />
                  <p className="text-xs text-green-100">
                    ✓ Ready to install with one tap!
                  </p>
                </motion.div>
              )}

              {/* Android Not Ready */}
              {!isIOS && !deferredPrompt && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-4 mb-4"
                >
                  <p className="text-sm font-semibold text-amber-100 mb-2">
                    📱 Install from Browser Menu:
                  </p>
                  <ol className="text-xs text-amber-100 space-y-1.5 list-decimal list-inside">
                    <li>
                      Tap the <strong>menu icon (⋮)</strong> in your browser
                    </li>
                    <li>
                      Look for <strong>Install app</strong> or{" "}
                      <strong>Add to Home screen</strong>
                    </li>
                    <li>Tap it and follow the prompts</li>
                  </ol>
                  <p className="text-xs text-amber-200 mt-2 italic">
                    💡 Or browse for a moment and try again!
                  </p>
                </motion.div>
              )}

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex gap-3"
              >
                {!isIOS && deferredPrompt ? (
                  <Button
                    onClick={handleInstall}
                    className="flex-1 bg-white text-[#d84040] hover:bg-gray-100 font-bold py-6 shadow-lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install Now
                  </Button>
                ) : (
                  <Button
                    onClick={handleDismiss}
                    className="flex-1 bg-white text-[#d84040] hover:bg-gray-100 font-bold py-6"
                  >
                    {isIOS ? "Got it!" : "OK"}
                  </Button>
                )}

                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="text-white hover:bg-white/10 font-semibold"
                >
                  Later
                </Button>
              </motion.div>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-xs text-white/60 mt-4"
              >
                {!isIOS && !deferredPrompt ? (
                  <>
                    {" "}
                    Can&apos;t see install option? Try: Menu (⋮) → Install app
                  </>
                ) : (
                  <>You can always install later from your browser menu</>
                )}
              </motion.p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

AddToHomePrompt.displayName = "AddToHomePrompt";
export default AddToHomePrompt;
