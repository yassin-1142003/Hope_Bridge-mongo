/**
 * Project Visit Tracking Hook
 * 
 * This hook automatically tracks when users view projects,
 * distinguishing between guests and authenticated users.
 */

import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface VisitTrackingOptions {
  projectId?: string;
  path?: string;
  locale?: string;
  referrer?: string;
}

interface TrackProjectVisitOptions {
  projectId: string;
  locale?: string;
  additionalData?: Record<string, any>;
}

export function useVisitTracking() {
  const { data: session, status } = useSession();

  // Track a project visit
  const trackProjectVisit = useCallback(async (options: TrackProjectVisitOptions) => {
    const { projectId, locale, additionalData = {} } = options;

    if (!projectId) {
      console.warn('Project ID is required for visit tracking');
      return;
    }

    try {
      const payload = {
        projectId,
        path: window.location.pathname,
        locale: locale || window.location.pathname.split('/')[1] || 'en',
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        userType: status === 'authenticated' ? 'user' : 'guest',
        userId: session?.user?.id || null,
        ...additionalData
      };

      // Use sendBeacon for better performance (doesn't block page unload)
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], {
          type: 'application/json'
        });
        navigator.sendBeacon('/api/analytics/visit', blob);
      } else {
        // Fallback to fetch
        await fetch('/api/analytics/visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          keepalive: true // Keep request alive even if page unloads
        });
      }

      console.log(`📊 Project visit tracked: ${projectId} (${status === 'authenticated' ? 'user' : 'guest'})`);
    } catch (error) {
      console.error('Failed to track project visit:', error);
    }
  }, [session, status]);

  // Track page visit (general)
  const trackPageVisit = useCallback(async (options: VisitTrackingOptions = {}) => {
    const { projectId, path, locale, referrer } = options;

    try {
      const payload = {
        path: path || window.location.pathname,
        locale: locale || window.location.pathname.split('/')[1] || 'en',
        projectId: projectId || null,
        referrer: referrer || document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        userType: status === 'authenticated' ? 'user' : 'guest',
        userId: session?.user?.id || null
      };

      // Use sendBeacon for better performance
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], {
          type: 'application/json'
        });
        navigator.sendBeacon('/api/analytics/visit', blob);
      } else {
        await fetch('/api/analytics/visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          keepalive: true
        });
      }

      console.log(`📊 Page visit tracked: ${path || window.location.pathname} (${status === 'authenticated' ? 'user' : 'guest'})`);
    } catch (error) {
      console.error('Failed to track page visit:', error);
    }
  }, [session, status]);

  return {
    trackProjectVisit,
    trackPageVisit,
    isTrackingEnabled: true,
    userType: status === 'authenticated' ? 'user' : 'guest',
    userId: session?.user?.id || null
  };
}
