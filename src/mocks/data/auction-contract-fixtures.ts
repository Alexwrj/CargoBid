import type { components } from '@/shared/api/generated/types';

type AuctionListResponse = components['schemas']['AuctionListResponseBase'];
type AuctionResponse = components['schemas']['AuctionShowResponse'];
type AuctionBetsResponse = components['schemas']['BetListResponse'];

export const auctionListFixture = {
  data: [],
  meta: {
    current_page: 1,
    from: 0,
    last_page: 1,
    per_page: 20,
    to: 0,
    total: 0,
  },
} satisfies AuctionListResponse;

export const auctionFixture = {
  main: {
    cargo_num: 'TEST-001',
    order_uid: '550e8400-e29b-41d4-a716-446655440000',
  },
  organizer: {},
  contacts: [],
  cargo: {},
  trading: {},
  payment: {},
  assembly: {},
  routes: [],
  admitted_organizations: [],
} satisfies AuctionResponse;

export const auctionBetsFixture = {
  bets: [],
} satisfies AuctionBetsResponse;
