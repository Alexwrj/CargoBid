import {
  HttpError,
  NetworkError,
  RequestAbortedError,
  ResponseParseError,
} from '@/shared/api/api-error';
import { getProblemTraceId } from '@/shared/api/problem-detail';

export interface AuctionDetailErrorView {
  description: string;
  isNotFound: boolean;
  traceId?: string;
}

export function presentAuctionDetailError(
  error: unknown,
): AuctionDetailErrorView {
  if (error instanceof HttpError && error.status === 404) {
    return {
      description: 'Возможно, аукцион был удалён или ссылка устарела.',
      isNotFound: true,
      traceId: getProblemTraceId(error.body),
    };
  }

  if (error instanceof NetworkError) {
    return {
      description:
        'Не удалось подключиться к сервису аукционов. Проверьте соединение и повторите попытку.',
      isNotFound: false,
    };
  }

  if (error instanceof HttpError) {
    return {
      description:
        error.status >= 500
          ? 'Сервис аукционов временно недоступен. Повторите попытку позже.'
          : 'Сервис не смог обработать запрос данных аукциона.',
      isNotFound: false,
      traceId: getProblemTraceId(error.body),
    };
  }

  if (error instanceof ResponseParseError) {
    return {
      description:
        'Сервис вернул ответ в неожиданном формате. Повторите попытку позже.',
      isNotFound: false,
    };
  }

  if (error instanceof RequestAbortedError) {
    return {
      description: 'Запрос данных аукциона был отменён.',
      isNotFound: false,
    };
  }

  return {
    description: 'Не удалось получить данные аукциона. Повторите попытку.',
    isNotFound: false,
  };
}
