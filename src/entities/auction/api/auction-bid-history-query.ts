import { queryOptions } from '@tanstack/react-query';

import { auctionKeys } from '@/entities/auction/api/auction-keys';
import { listBets } from '@/shared/api/generated/auctions/bets/listBets';

export function auctionBidHistoryQueryOptions(auctionUuid: string) {
  return queryOptions({
    queryFn: ({ signal }) => listBets({ auctionUuid, signal }),
    queryKey: auctionKeys.bets(auctionUuid),
  });
}
