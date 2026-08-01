import { queryOptions } from '@tanstack/react-query';

import { auctionKeys } from '@/entities/auction/api/auction-keys';
import {
  listAuctions,
  type ListAuctionsRequestBody,
} from '@/shared/api/generated/auctions/list/listAuctions';

export function auctionListQueryOptions(request: ListAuctionsRequestBody) {
  return queryOptions({
    queryFn: ({ signal }) => listAuctions({ body: request, signal }),
    queryKey: auctionKeys.list(request),
  });
}
