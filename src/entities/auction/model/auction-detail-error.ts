import {
  HttpError,
  NetworkError,
  RequestAbortedError,
  ResponseParseError,
} from '@/shared/api/api-error';

interface ErrorBodyWithTraceId {
  trace_id?: unknown;
}

function getTraceId(body: unknown) {
  if (!body || typeof body !== 'object') return undefined;

  const traceId = (body as ErrorBodyWithTraceId).trace_id;

  return typeof traceId === 'string' ? traceId : undefined;
}

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
      traceId: getTraceId(error.body),
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
      traceId: getTraceId(error.body),
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
