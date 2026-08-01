import type { ListAuctionsRequestBody } from '@/shared/api/generated/auctions/list/listAuctions';

export const auctionKeys = {
  all: ['auctions'] as const,
  lists: () => [...auctionKeys.all, 'list'] as const,
  list: (request: ListAuctionsRequestBody) =>
    [...auctionKeys.lists(), request] as const,
  details: () => [...auctionKeys.all, 'detail'] as const,
  detail: (auctionUuid: string) =>
    [...auctionKeys.details(), auctionUuid] as const,
  bets: (auctionUuid: string) =>
    [...auctionKeys.all, 'bets', auctionUuid] as const,
};
