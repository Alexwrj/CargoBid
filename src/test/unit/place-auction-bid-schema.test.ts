import { describe, expect, it } from 'vitest';

import { createPlaceAuctionBidSchema } from '@/features/place-auction-bid/model/place-auction-bid-schema';

const schema = createPlaceAuctionBidSchema({
  currencyCode: '643',
  max: 100_000,
  min: 62_000,
});

describe('place auction bid schema', () => {
  it('normalizes supported human-readable amounts', () => {
    expect(schema.parse({ amount: '62 000' })).toEqual({ amount: 62_000 });
    expect(schema.parse({ amount: '62 500,50' })).toEqual({ amount: 62_500.5 });
  });

  it('rejects a non-numeric amount', () => {
    const result = schema.safeParse({ amount: '6e4' });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues[0]?.message).toBe(
      'Введите сумму числом без букв и специальных символов',
    );
  });

  it('applies direct contract bounds', () => {
    expect(schema.safeParse({ amount: '61999' }).success).toBe(false);
    expect(schema.safeParse({ amount: '100001' }).success).toBe(false);
  });
});
