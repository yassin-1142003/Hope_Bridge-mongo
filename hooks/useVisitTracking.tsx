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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        timestamp: new Date().toISOString(),
        userType: status === 'authenticated' ? 'user' : 'guest',
        userId: session?.user?.id || null,
        ...additionalData
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        userType: status === 'authenticated' ? 'user' : 'guest',
        userId: session?.user?.id || null,
        sessionId: getSessionId(),
        metadata: {
          timestamp: new Date().toISOString(),
          ...additionalData
        },
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  // Track page view (general visit tracking)
  const trackPageView = useCallback(async (path?: string, additionalData?: Record<string, any>) => {
    try {
      const payload = {
        path: path || window.location.pathname,
        referrer: document.referrer,
        locale: window.location.pathname.split('/')[1] || 'en',
        userAgent: navigator.userAgent,
        userType: status === 'authenticated' ? 'user' : 'guest',
        userId: session?.user?.id || null,
        sessionId: getSessionId(),
        metadata: {
          timestamp: new Date().toISOString(),
          ...additionalData
        },
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      console.log(`📊 Page visit tracked: ${path || window.location.pathname} (${status === 'authenticated' ? 'user' : 'guest'})`);
    } catch (error) {
      console.error('Failed to track page visit:', error);
=======
      console.log(`📊 Page view tracked: ${path || window.location.pathname} (${status === 'authenticated' ? 'user' : 'guest'})`);
    } catch (error) {
      console.error('Failed to track page view:', error);
>>>>>>> Stashed changes
=======
      console.log(`📊 Page view tracked: ${path || window.location.pathname} (${status === 'authenticated' ? 'user' : 'guest'})`);
    } catch (error) {
      console.error('Failed to track page view:', error);
>>>>>>> Stashed changes
=======
      console.log(`📊 Page view tracked: ${path || window.location.pathname} (${status === 'authenticated' ? 'user' : 'guest'})`);
    } catch (error) {
      console.error('Failed to track page view:', error);
>>>>>>> Stashed changes
    }
  }, [session, status]);

  return {
    trackProjectVisit,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    trackPageVisit,
    isTrackingEnabled: true,
    userType: status === 'authenticated' ? 'user' : 'guest',
    userId: session?.user?.id || null
  };
}
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    trackPageView,
    isAuthenticated: status === 'authenticated',
    user: session?.user,
  };
}

// Helper function to get or create session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('visit_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('visit_session_id', sessionId);
  }
  return sessionId;
}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
