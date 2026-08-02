import { useMutation, useQueryClient } from '@tanstack/react-query';

import { auctionKeys } from '@/entities/auction/api/auction-keys';
import { HttpError } from '@/shared/api/api-error';
import {
  setBet,
  type SetBetRequestBody,
} from '@/shared/api/generated/auctions/bets/setBet';

function shouldRefreshAuction(error: unknown) {
  return (
    error instanceof HttpError && (error.status === 404 || error.status === 422)
  );
}

export function usePlaceAuctionBid(auctionUuid: string) {
  const queryClient = useQueryClient();

  const refreshAuction = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        exact: true,
        queryKey: auctionKeys.detail(auctionUuid),
      }),
      queryClient.invalidateQueries({
        exact: true,
        queryKey: auctionKeys.bets(auctionUuid),
      }),
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() }),
    ]);
  };

  return useMutation({
    mutationFn: (body: SetBetRequestBody) => setBet({ auctionUuid, body }),
    onError: async (error) => {
      if (shouldRefreshAuction(error)) {
        await refreshAuction();
      }
    },
    onSuccess: refreshAuction,
  });
}
