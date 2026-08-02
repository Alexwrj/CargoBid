import { describe, expect, it } from 'vitest';

import {
  auctionFilterFormSchema,
  searchToAuctionListRequest,
  type AuctionFilterFormValues,
} from '@/features/auction-filters/model/auction-filter-search';

const emptyForm: AuctionFilterFormValues = {
  auctionStatus: '',
  auctionType: '',
  bodyType: '',
  cargoNum: '',
  isAvailable: '',
  loadCity: '',
  unloadCity: '',
  userStatus: '',
  weightFrom: null,
  weightTo: null,
};

describe('auction filter form schema', () => {
  it('accepts an empty draft and a valid weight range', () => {
    expect(auctionFilterFormSchema.safeParse(emptyForm).success).toBe(true);
    expect(
      auctionFilterFormSchema.safeParse({
        ...emptyForm,
        weightFrom: 5,
        weightTo: 12,
      }).success,
    ).toBe(true);
  });

  it('rejects a maximum weight below the minimum', () => {
    const result = auctionFilterFormSchema.safeParse({
      ...emptyForm,
      weightFrom: 12,
      weightTo: 5,
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues).toContainEqual(
      expect.objectContaining({
        message: 'Максимальный вес должен быть не меньше минимального',
        path: ['weightTo'],
      }),
    );
  });

  it('maps the auction type from URL-state to the contract field', () => {
    expect(searchToAuctionListRequest({ auctionType: 'FixPrice' })).toEqual(
      expect.objectContaining({ auc_type: ['FixPrice'] }),
    );
  });
});
