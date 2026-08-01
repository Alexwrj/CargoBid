export const filterableAuctionStatuses = [
  'Planning',
  'Auction',
  'DeterminateWinner',
  'WaitDeal',
  'InProgress',
  'Finished',
  'Stopped',
  'Canceled',
] as const;

export type FilterableAuctionStatus =
  (typeof filterableAuctionStatuses)[number];

export const auctionStatusIds = {
  Auction: 2,
  Canceled: 8,
  DeterminateWinner: 3,
  Finished: 6,
  InProgress: 5,
  Planning: 1,
  Stopped: 7,
  WaitDeal: 4,
} as const satisfies Record<FilterableAuctionStatus, number>;
