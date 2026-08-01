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

export interface AuctionListErrorView {
  description: string;
  traceId?: string;
}

export function presentAuctionListError(error: unknown): AuctionListErrorView {
  if (error instanceof NetworkError) {
    return {
      description:
        'Не удалось подключиться к сервису аукционов. Проверьте соединение и повторите попытку.',
    };
  }

  if (error instanceof HttpError) {
    return {
      description:
        error.status >= 500
          ? 'Сервис аукционов временно недоступен. Повторите попытку позже.'
          : 'Сервис не смог обработать запрос списка аукционов.',
      traceId: getTraceId(error.body),
    };
  }

  if (error instanceof ResponseParseError) {
    return {
      description:
        'Сервис вернул ответ в неожиданном формате. Повторите попытку позже.',
    };
  }

  if (error instanceof RequestAbortedError) {
    return { description: 'Запрос списка аукционов был отменён.' };
  }

  return {
    description: 'Не удалось получить список аукционов. Повторите попытку.',
  };
}
