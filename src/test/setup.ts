import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { resetAuctionMockState } from '@/mocks/data/auction-contract-fixtures';
import { server } from '@/mocks/server';

beforeAll(() => {
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
    writable: true,
  });
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetAuctionMockState();
});

afterAll(() => {
  server.close();
});
