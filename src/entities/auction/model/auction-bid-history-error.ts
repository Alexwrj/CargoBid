import { HttpError } from '@/shared/api/api-error';
import { getProblemTraceId } from '@/shared/api/problem-detail';

interface AuctionBidHistoryErrorView {
  description: string;
  traceId?: string;
}

export function presentAuctionBidHistoryError(
  error: unknown,
): AuctionBidHistoryErrorView {
  return {
    description:
      'Основные данные аукциона доступны. Повторите загрузку истории.',
    traceId:
      error instanceof HttpError ? getProblemTraceId(error.body) : undefined,
  };
}
