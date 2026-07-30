import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/mocks/server';

const healthUrl = 'http://localhost/api/v1/health';

describe('MSW test server', () => {
  it('supports a test-specific handler override', async () => {
    server.use(
      http.get('*/api/v1/health', () => {
        return HttpResponse.json({ status: 'overridden' });
      }),
    );

    const response = await fetch(healthUrl);

    await expect(response.json()).resolves.toEqual({ status: 'overridden' });
  });

  it('resets test-specific handlers between tests', async () => {
    const response = await fetch(healthUrl);

    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });
});
