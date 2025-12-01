// hooks/usePerformanceOptimizations.ts - Performance optimization hooks
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

export interface LoadingState {
  isLoading: boolean;
  isInitialLoad: boolean;
  isRefreshing: boolean;
  progress: number;
  message?: string;
}

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  networkRequests: number;
}

// Enhanced loading state hook
export function useLoadingState(initialMessage?: string) {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    isInitialLoad: true,
    isRefreshing: false,
    progress: 0,
    message: initialMessage
  });

  const startLoading = useCallback((message?: string, isRefresh = false) => {
    setState(prev => ({
      isLoading: true,
      isInitialLoad: prev.isInitialLoad && !isRefresh,
      isRefreshing: isRefresh,
      progress: 0,
      message: message || prev.message
    }));
  }, []);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || prev.message
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100
    }));
  }, []);

  const resetLoading = useCallback(() => {
    setState({
      isLoading: false,
      isInitialLoad: true,
      isRefreshing: false,
      progress: 0,
      message: initialMessage
    });
  }, [initialMessage]);

  return {
    ...state,
    startLoading,
    updateProgress,
    stopLoading,
    resetLoading
  };
}

// Debounced value hook
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttled function hook
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
      }, delay - (Date.now() - lastRun.current));
    }
  }, [callback, delay]) as T;
}

// Infinite scroll hook
export function useInfiniteScroll<T>(
  fetchFunction: (page: number) => Promise<T[]>,
  options: {
    threshold?: number;
    initialPage?: number;
    pageSize?: number;
  } = {}
) {
  const { threshold = 100, initialPage = 1, pageSize = 20 } = options;
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const newData = await fetchFunction(page);
      
      if (newData.length < pageSize) {
        setHasMore(false);
      }

      setData(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, page, pageSize, isLoading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
  }, [initialPage]);

  // Intersection observer for infinite scroll
  const observerRef = useRef<IntersectionObserver>();
  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, { threshold: threshold / 100 });

    if (node) observerRef.current.observe(node);
  }, [isLoading, hasMore, loadMore, threshold]);

  return {
    data,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    lastElementRef
  };
}

// Virtual list hook for large datasets
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [items.length, itemHeight, containerHeight, scrollTop, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const scrollElementProps = {
    onScroll: useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, []),
    style: { height: containerHeight, overflow: 'auto' }
  };

  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollElementProps,
    startIndex: visibleRange.startIndex
  };
}

// Cache hook for memoized data
export function useCache<T>(key: string, fetcher: () => Promise<T>, ttl = 5 * 60 * 1000) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const fetch = useCallback(async (force = false) => {
    const cached = cacheRef.current.get(key);
    
    if (!force && cached && Date.now() - cached.timestamp < ttl) {
      setData(cached.data);
      return cached.data;
    }

    setIsLoading(true);
    setError(null);

    try {
      const freshData = await fetcher();
      cacheRef.current.set(key, { data: freshData, timestamp: Date.now() });
      setData(freshData);
      return freshData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttl]);

  const invalidate = useCallback(() => {
    cacheRef.current.delete(key);
  }, [key]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, fetch, invalidate, clearCache };
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    networkRequests: 0
  });

  const measureRender = useCallback((name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    const renderTime = end - start;
    
    console.log(`[Performance] ${name} rendered in ${renderTime.toFixed(2)}ms`);
    metricsRef.current.renderTime = renderTime;
  }, []);

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metricsRef.current.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      return memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0;
  }, []);

  const trackNetworkRequest = useCallback(() => {
    metricsRef.current.networkRequests++;
  }, []);

  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  return {
    measureRender,
    getMemoryUsage,
    trackNetworkRequest,
    getMetrics
  };
}

// Optimized image loading hook
export function useOptimizedImage(src: string, options: {
    lazy?: boolean;
    placeholder?: string;
    threshold?: number;
  } = {}) {
  const { lazy = true, placeholder = '/placeholder.webp', threshold = 100 } = options;
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!lazy) {
      loadImage();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadImage();
          observer.disconnect();
        }
      },
      { threshold: threshold / 100 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, lazy, threshold]);

  const loadImage = useCallback(() => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setError(null);
    };

    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };
  }, [src]);

  return {
    src: imageSrc,
    isLoading,
    error,
    ref: imgRef
  };
}

// Background task hook
export function useBackgroundTask<T>(
  task: () => Promise<T>,
  options: {
    onSuccess?: (result: T) => void;
    onError?: (error: Error) => void;
    retryCount?: number;
    retryDelay?: number;
  } = {}
) {
  const { onSuccess, onError, retryCount = 3, retryDelay = 1000 } = options;
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setIsRunning(true);
    setError(null);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const taskResult = await task();
        setResult(taskResult);
        onSuccess?.(taskResult);
        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        
        if (attempt < retryCount) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    setError(lastError);
    onError?.(lastError!);
    setIsRunning(false);
  }, [task, onSuccess, onError, retryCount, retryDelay]);

  return {
    execute,
    isRunning,
    result,
    error
  };
}

// Optimized form hook
export function useOptimizedForm<T extends Record<string, any>>(
  initialValues: T,
  options: {
    validateOnChange?: boolean;
    debounceMs?: number;
  } = {}
) {
  const { validateOnChange = false, debounceMs = 300 } = options;
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedValues = useDebouncedValue(values, debounceMs);

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const setError = useCallback(<K extends keyof T>(field: K, error: string | undefined) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const validate = useCallback((validator: (values: T) => Partial<Record<keyof T, string>>) => {
    const newErrors = validator(values);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(async (
    onSubmit: (values: T) => Promise<void>,
    validator?: (values: T) => Partial<Record<keyof T, string>>
  ) => {
    if (validator && !validate(validator)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);

  // Validate on change if enabled
  useEffect(() => {
    if (validateOnChange && Object.keys(touched).length > 0) {
      // Validation would be called here if a validator was provided
    }
  }, [debouncedValues, validateOnChange, touched]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setError,
    validate,
    reset,
    handleSubmit
  };
}
