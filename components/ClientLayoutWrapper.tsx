"use client";

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { PWAProvider } from './PWAContext';
import VisitorTracker from './VisitorTracker';
import Navbar from './layout/Navbar';
import ChatWidget from './ChatWidget';

interface ClientLayoutWrapperProps {
  children: ReactNode;
  locale: string;
  session: any;
  messages: any;
}

export default function ClientLayoutWrapper({ 
  children, 
  locale, 
  session,
  messages
}: ClientLayoutWrapperProps) {
  return (
    <SessionProvider session={session}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <PWAProvider>
            <VisitorTracker locale={locale} />
            <Navbar />
            {children}
            <ChatWidget locale={locale} />
          </PWAProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
