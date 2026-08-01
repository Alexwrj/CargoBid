export type HttpMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';

interface ApiErrorOptions {
  cause?: unknown;
  method: HttpMethod;
  url: string;
}

export class ApiError extends Error {
  readonly method: HttpMethod;
  readonly url: string;

  constructor(message: string, { cause, method, url }: ApiErrorOptions) {
    super(message, { cause });
    this.name = new.target.name;
    this.method = method;
    this.url = url;
  }
}

interface HttpErrorOptions<TBody> extends ApiErrorOptions {
  body: TBody;
  status: number;
}

export class HttpError<TBody = unknown> extends ApiError {
  readonly body: TBody;
  readonly status: number;

  constructor({ body, method, status, url }: HttpErrorOptions<TBody>) {
    super(`HTTP ${status} for ${method} ${url}`, { method, url });
    this.body = body;
    this.status = status;
  }
}

export class NetworkError extends ApiError {
  constructor(options: ApiErrorOptions) {
    super(
      `Network request failed for ${options.method} ${options.url}`,
      options,
    );
  }
}

export class RequestAbortedError extends ApiError {
  constructor(options: ApiErrorOptions) {
    super(`Request was aborted for ${options.method} ${options.url}`, options);
  }
}

interface ResponseParseErrorOptions extends ApiErrorOptions {
  responseBody?: string;
  status: number;
}

export class ResponseParseError extends ApiError {
  readonly responseBody?: string;
  readonly status: number;

  constructor({
    method,
    responseBody,
    status,
    url,
    ...options
  }: ResponseParseErrorOptions) {
    super(`Expected a JSON response from ${method} ${url}`, {
      ...options,
      method,
      url,
    });
    this.responseBody = responseBody;
    this.status = status;
  }
}
