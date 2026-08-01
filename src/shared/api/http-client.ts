import {
  HttpError,
  NetworkError,
  RequestAbortedError,
  ResponseParseError,
  type HttpMethod,
} from './api-error';

interface HttpClientOptions {
  baseUrl: string;
  fetchImplementation?: typeof fetch;
}

interface RequestOptions<TBody> {
  body?: TBody;
  method: HttpMethod;
  path: string;
  responseType?: 'json' | 'void';
  signal?: AbortSignal;
}

interface ParsedResponseBody {
  parseError?: unknown;
  raw?: string;
  value?: unknown;
}

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

function parseResponseBody(raw: string): ParsedResponseBody {
  if (!raw) {
    return {};
  }

  try {
    return { raw, value: JSON.parse(raw) as unknown };
  } catch (parseError) {
    return { parseError, raw };
  }
}

export function createHttpClient({
  baseUrl,
  fetchImplementation,
}: HttpClientOptions) {
  return {
    async request<TResponse, TBody = never>({
      body,
      method,
      path,
      responseType = 'json',
      signal,
    }: RequestOptions<TBody>): Promise<TResponse> {
      const url = joinUrl(baseUrl, path);

      if (signal?.aborted) {
        throw new RequestAbortedError({ method, url });
      }

      const headers = new Headers({ Accept: 'application/json' });

      if (body !== undefined) {
        headers.set('Content-Type', 'application/json');
      }

      let response: Response;

      try {
        const executeFetch = fetchImplementation ?? globalThis.fetch;

        response = await executeFetch(url, {
          body: body === undefined ? undefined : JSON.stringify(body),
          headers,
          method,
          signal,
        });
      } catch (cause) {
        if (signal?.aborted || isAbortError(cause)) {
          throw new RequestAbortedError({ cause, method, url });
        }

        throw new NetworkError({ cause, method, url });
      }

      let rawBody: string;

      try {
        rawBody = await response.text();
      } catch (cause) {
        if (signal?.aborted || isAbortError(cause)) {
          throw new RequestAbortedError({ cause, method, url });
        }

        throw new NetworkError({ cause, method, url });
      }

      const parsedBody = parseResponseBody(rawBody);

      if (!response.ok) {
        throw new HttpError({
          body: parsedBody.parseError ? rawBody : parsedBody.value,
          method,
          status: response.status,
          url,
        });
      }

      if (responseType === 'void') {
        return undefined as TResponse;
      }

      if (!rawBody || parsedBody.parseError) {
        throw new ResponseParseError({
          cause: parsedBody.parseError,
          method,
          responseBody: rawBody || undefined,
          status: response.status,
          url,
        });
      }

      return parsedBody.value as TResponse;
    },
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;
