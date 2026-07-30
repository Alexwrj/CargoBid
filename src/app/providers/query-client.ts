import { QueryClient } from '@tanstack/react-query';

interface CreateQueryClientOptions {
  isTest?: boolean;
}

export function createQueryClient({
  isTest = import.meta.env.MODE === 'test',
}: CreateQueryClientOptions = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: isTest ? false : 1,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
