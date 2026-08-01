import { getApiBaseUrl } from './config';
import { createHttpClient } from './http-client';

export const apiClient = createHttpClient({ baseUrl: getApiBaseUrl() });
