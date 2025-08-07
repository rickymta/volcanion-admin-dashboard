import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, PaginatedResponse, ApiError } from '../api/types';

// Generic API hook state
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

// Hook for single API call
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = [],
  immediate: boolean = true
): ApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as ApiError,
      });
    }
  }, dependencies);

  const refetch = useCallback(async () => {
    await execute();
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return { ...state, refetch };
}

// Hook for paginated API calls
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number, params?: any) => Promise<PaginatedResponse<T>>,
  initialPage: number = 1,
  initialLimit: number = 10,
  dependencies: any[] = []
): {
  data: T[];
  pagination: PaginatedResponse<T>['pagination'] | null;
  loading: boolean;
  error: ApiError | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
} {
  const [state, setState] = useState<{
    data: T[];
    pagination: PaginatedResponse<T>['pagination'] | null;
    loading: boolean;
    error: ApiError | null;
    page: number;
    limit: number;
  }>({
    data: [],
    pagination: null,
    loading: true,
    error: null,
    page: initialPage,
    limit: initialLimit,
  });

  const fetchData = useCallback(async (page: number, limit: number, append: boolean = false) => {
    if (!append) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const response = await apiCall(page, limit);
      setState(prev => ({
        ...prev,
        data: append ? [...prev.data, ...response.data] : response.data,
        pagination: response.pagination,
        loading: false,
        error: null,
        page,
        limit,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as ApiError,
      }));
    }
  }, [apiCall, ...dependencies]);

  const loadMore = useCallback(async () => {
    if (state.pagination && state.page < state.pagination.totalPages) {
      await fetchData(state.page + 1, state.limit, true);
    }
  }, [state.pagination, state.page, state.limit, fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(1, state.limit);
  }, [state.limit, fetchData]);

  const setPage = useCallback(async (page: number) => {
    await fetchData(page, state.limit);
  }, [state.limit, fetchData]);

  const setLimit = useCallback(async (limit: number) => {
    await fetchData(state.page, limit);
  }, [state.page, fetchData]);

  useEffect(() => {
    fetchData(initialPage, initialLimit);
  }, dependencies);

  return {
    data: state.data,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,
    loadMore,
    refresh,
    setPage,
    setLimit,
  };
}

// Hook for async operations (create, update, delete)
export function useAsyncOperation<T, P = any>(
  operation: (params: P) => Promise<ApiResponse<T>>
): {
  loading: boolean;
  error: ApiError | null;
  execute: (params: P) => Promise<T | null>;
  reset: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async (params: P): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await operation(params);
      return response.data;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [operation]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { loading, error, execute, reset };
}

// Hook for file upload
export function useFileUpload(): {
  loading: boolean;
  progress: number;
  error: ApiError | null;
  upload: (file: File, url: string, fieldName?: string) => Promise<any>;
  reset: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<ApiError | null>(null);

  const upload = useCallback(async (file: File, url: string, fieldName: string = 'file') => {
    setLoading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append(fieldName, file);

    try {
      // Note: In a real implementation, you'd use the API client with progress tracking
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new ApiError('Upload failed', response.status);
      }

      const result = await response.json();
      setProgress(100);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setProgress(0);
    setError(null);
  }, []);

  return { loading, progress, error, upload, reset };
}

export default {
  useApi,
  usePaginatedApi,
  useAsyncOperation,
  useFileUpload,
};
