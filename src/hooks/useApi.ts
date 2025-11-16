import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions {
  immediate?: boolean;
}

export function useApi<T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions = { immediate: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
      return result;
    } catch (err: unknown) {
      let errorMessage = 'An error occurred';
      if (err && typeof err === 'object') {
        if ('response' in err && err.response && typeof err.response === 'object') {
          const response = err.response as { data?: { message?: string } };
          errorMessage = response.data?.message || errorMessage;
        } else if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  return { data, loading, error, execute, refetch: execute };
}
