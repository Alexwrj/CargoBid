const DEVELOPMENT_API_BASE_URL = '/api/v1';
const TEST_API_BASE_URL = 'http://localhost/api/v1';

interface ApiEnvironment {
  MODE: string;
  VITE_API_BASE_URL?: string;
}

function removeTrailingSlashes(value: string) {
  return value.replace(/\/+$/, '');
}

export function getApiBaseUrl(
  environment: ApiEnvironment = import.meta.env,
): string {
  const configuredBaseUrl = environment.VITE_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return removeTrailingSlashes(configuredBaseUrl);
  }

  if (environment.MODE === 'development') {
    return DEVELOPMENT_API_BASE_URL;
  }

  if (environment.MODE === 'test') {
    return TEST_API_BASE_URL;
  }

  throw new Error(
    'VITE_API_BASE_URL is required outside development and test environments.',
  );
}
