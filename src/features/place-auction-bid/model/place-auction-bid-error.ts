import { HttpError } from '@/shared/api/api-error';
import { getProblemTraceId } from '@/shared/api/problem-detail';

interface PlaceAuctionBidErrorView {
  description: string;
  traceId?: string;
}

export function presentPlaceAuctionBidError(
  error: unknown,
): PlaceAuctionBidErrorView {
  if (error instanceof HttpError) {
    if (error.status === 422) {
      return {
        description:
          'Ставка отклонена. Проверьте актуальные данные и условия аукциона.',
        traceId: getProblemTraceId(error.body),
      };
    }

    if (error.status === 404) {
      return {
        description: 'Аукцион больше недоступен. Данные страницы обновлены.',
        traceId: getProblemTraceId(error.body),
      };
    }

    return {
      description: 'Не удалось отправить ставку. Попробуйте ещё раз.',
      traceId: getProblemTraceId(error.body),
    };
  }

  return {
    description:
      'Не удалось отправить ставку. Проверьте соединение и повторите.',
  };
}
