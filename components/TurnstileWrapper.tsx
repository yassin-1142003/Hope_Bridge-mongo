// components/TurnstileWrapper.tsx
"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { useLocale } from "next-intl";
import { useState, useEffect } from "react";

export default function TurnstileWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string>("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const locale = useLocale();

  useEffect(() => {
    // Check if already verified
    if (typeof window !== "undefined") {
      const verified = sessionStorage.getItem("turnstile_verified");
      if (verified === "true") {
        setIsVerified(true);
      }
      setIsChecking(false);
    }
  }, []);

  const handleVerify = async (token: string) => {
    setToken(token);
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        sessionStorage.setItem("turnstile_verified", "true");
        console.log("✅ Verification successful");
      } else {
        setError("❌ Verification failed - Please try again");
        console.error("Bot detected:", data);
      }
    } catch (error) {
      setError("❌ Verification error");
      console.error("Verification failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error: string) => {
    console.error("Turnstile error:", error);
    setError("❌ CAPTCHA error - Please try again");
  };

  const handleExpire = () => {
    console.log("⚠️ CAPTCHA expired");
    setError("⏱️ Verification expired - Please try again");
  };

  // Show loading state while checking verification
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If verified, show the actual content
  if (isVerified) {
    return <>{children}</>;
  }

  // Show CAPTCHA challenge
  return (
    <>
      {/* Blurred background preview (optional) */}
      <div className="blur-sm pointer-events-none opacity-30">{children}</div>

      {/* CAPTCHA Overlay */}
      <div className="fixed  inset-0 bg-[#1a1a1a] bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-[#f5f5f5]  p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl text-[#1a1a1a] font-black mb-2">
              {locale === "ar" ? "التحقق من انك انسان" : " Verify You're Human"}
            </h2>
            <p className="text-gray-800">
              {locale === "ar"
                ? "  من فضلك قم بتحقق من انك انسان للوصول إلى موقع جمعية جسر الامل "
                : "  Please complete the verification to access Hope Bridge Charity Website "}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {/* {isLoading && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
              Verifying... 🔍
            </div>
          )} */}

          <div className="flex justify-center">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
              onSuccess={handleVerify}
              onError={handleError}
              onExpire={handleExpire}
              options={{
                language: locale === "ar" ? "ar" : "en",
                theme: "dark",
                size: "flexible",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
