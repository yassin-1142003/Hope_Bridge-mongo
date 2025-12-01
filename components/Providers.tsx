'use client';

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
