import { HttpError } from '@/shared/api/api-error';

interface PlaceAuctionBidErrorView {
  description: string;
  shouldRefresh: boolean;
  traceId?: string;
}

function getTraceId(error: HttpError) {
  if (!error.body || typeof error.body !== 'object') return undefined;

  const traceId = (error.body as { trace_id?: unknown }).trace_id;

  return typeof traceId === 'string' ? traceId : undefined;
}

export function presentPlaceAuctionBidError(
  error: unknown,
): PlaceAuctionBidErrorView {
  if (error instanceof HttpError) {
    if (error.status === 422) {
      return {
        description:
          'Условия торгов изменились или сумма отклонена. Проверьте актуальные данные и повторите ставку.',
        shouldRefresh: true,
        traceId: getTraceId(error),
      };
    }

    if (error.status === 404) {
      return {
        description: 'Аукцион больше недоступен. Данные страницы обновлены.',
        shouldRefresh: true,
        traceId: getTraceId(error),
      };
    }

    return {
      description: 'Не удалось отправить ставку. Попробуйте ещё раз.',
      shouldRefresh: false,
      traceId: getTraceId(error),
    };
  }

  return {
    description:
      'Не удалось отправить ставку. Проверьте соединение и повторите.',
    shouldRefresh: false,
  };
}
