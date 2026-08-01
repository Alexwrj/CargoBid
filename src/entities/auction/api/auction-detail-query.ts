import { queryOptions } from '@tanstack/react-query';

import { auctionKeys } from '@/entities/auction/api/auction-keys';
import { getAuction } from '@/shared/api/generated/auctions/getAuction';

export function auctionDetailQueryOptions(auctionUuid: string) {
  return queryOptions({
    queryFn: ({ signal }) => getAuction({ auctionUuid, signal }),
    queryKey: auctionKeys.detail(auctionUuid),
  });
}
