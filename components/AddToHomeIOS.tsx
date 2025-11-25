"use client";
import { usePWA } from "@/components/PWAContext";
import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export default function AddToHomeIOS() {
  const [closed, setClosed] = useState(false);
  const pwa = usePWA();

  // Show ONLY if:
  // 1) iOS device
  // 2) Not already installed
  // 3) User didn't close message
  if (!pwa?.isIOS || pwa?.isStandalone || closed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background/90 backdrop-blur-md border border-primary/40 shadow-xl rounded-2xl p-4 w-[90%] max-w-sm animate-in fade-in slide-in-from-bottom duration-300">
      <Button
        onClick={() => setClosed(true)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-primary"
      >
        <X size={18} />
      </Button>

      <p className="text-sm text-center font-medium text-foreground leading-relaxed">
        To install this app on your iPhone:
        <br />
        <span className="font-semibold text-primary">
          Tap the Share icon
        </span> →{" "}
        <span className="font-semibold text-primary">Add to Home Screen</span>.
      </p>
    </div>
  );
}
