import { QueryClient } from '@tanstack/react-query';

import { HttpError } from '@/shared/api/api-error';

interface CreateQueryClientOptions {
  isTest?: boolean;
}

export function createQueryClient({
  isTest = import.meta.env.MODE === 'test',
}: CreateQueryClientOptions = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: isTest
          ? false
          : (failureCount, error) =>
              !(error instanceof HttpError && error.status === 404) &&
              failureCount < 1,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
