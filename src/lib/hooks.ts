import { useState, useEffect, useCallback, useMemo } from 'react';
import { appCache, createCacheKey, CACHE_TTL } from './cache';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationControls {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  goToFirst: () => void;
  goToLast: () => void;
}

export interface UsePaginatedDataResult<T> {
  data: T[];
  paginatedData: T[];
  pagination: PaginationState;
  controls: PaginationControls;
  isLoading: boolean;
  error: string | null;
  refresh: (force?: boolean) => Promise<void>;
  lastUpdated: Date | null;
}

export interface UsePaginatedDataOptions {
  cacheKey: string;
  cacheTTL?: number;
  initialPageSize?: number;
  initialPage?: number;
}

/**
 * Hook for fetching and paginating data with caching support
 */
export function usePaginatedData<T>(
  fetchFn: () => Promise<T[]>,
  options: UsePaginatedDataOptions
): UsePaginatedDataResult<T> {
  const {
    cacheKey,
    cacheTTL = CACHE_TTL.MEDIUM,
    initialPageSize = 10,
    initialPage = 1,
  } = options;

  const [allData, setAllData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch data with caching
  const fetchData = useCallback(async (force = false) => {
    const fullCacheKey = createCacheKey(cacheKey);

    // Try to get from cache first (unless force refresh)
    if (!force) {
      const cachedData = appCache.get<T[]>(fullCacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for: ${fullCacheKey}`);
        setAllData(cachedData);
        setIsLoading(false);
        return;
      }
    }

    console.log(`🔄 Fetching fresh data for: ${fullCacheKey}`);
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchFn();
      
      // Store in cache
      appCache.set(fullCacheKey, data, cacheTTL);
      
      setAllData(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error(`❌ Error fetching data:`, err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, cacheTTL, fetchFn]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate pagination
  const totalItems = allData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure current page is within bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allData.slice(startIndex, endIndex);
  }, [allData, currentPage, pageSize]);

  // Pagination controls
  const controls: PaginationControls = useMemo(() => ({
    goToPage: (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    nextPage: () => {
      if (currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
      }
    },
    prevPage: () => {
      if (currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    },
    setPageSize: (size: number) => {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when changing page size
    },
    goToFirst: () => setCurrentPage(1),
    goToLast: () => setCurrentPage(totalPages),
  }), [currentPage, totalPages]);

  const pagination: PaginationState = {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
  };

  return {
    data: allData,
    paginatedData,
    pagination,
    controls,
    isLoading,
    error,
    refresh: fetchData,
    lastUpdated,
  };
}

/**
 * Hook for simple data fetching with caching (no pagination)
 */
export function useCachedData<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  cacheTTL: number = CACHE_TTL.MEDIUM
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (!force) {
      const cachedData = appCache.get<T>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for: ${cacheKey}`);
        setData(cachedData);
        setIsLoading(false);
        return;
      }
    }

    console.log(`🔄 Fetching fresh data for: ${cacheKey}`);
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      appCache.set(cacheKey, result, cacheTTL);
      setData(result);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error(`❌ Error fetching data:`, err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, cacheTTL, fetchFn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
    lastUpdated,
  };
}
