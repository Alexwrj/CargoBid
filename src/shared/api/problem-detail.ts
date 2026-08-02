export function getProblemTraceId(body: unknown) {
  if (!body || typeof body !== 'object') return undefined;

  const traceId = (body as { trace_id?: unknown }).trace_id;

  return typeof traceId === 'string' ? traceId : undefined;
}
