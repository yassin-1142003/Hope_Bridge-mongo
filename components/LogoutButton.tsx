"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "./ui/button";

import * as React from "react";
export default function LogoutButton({ params }: { params: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const isArabic = params === "ar";

  const handleLogout = async () => {
    setIsLoading(true); // ✅ show spinner
    try {
      await signOut({ callbackUrl: "/" }); // redirect after sign out
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false); // reset if something goes wrong
    }
  };

  return (
    <Button
      onClick={handleLogout}
      type="button"
      disabled={isLoading}
      className={`w-[145px] cursor-pointer rounded-none flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold text-white transition-all duration-200 ${
        isLoading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
      }`}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Logging out...
        </>
      ) : isArabic ? (
        "تسجيل الخروج"
      ) : (
        "Log out"
      )}
    </Button>
  );
}
