import {
  createBrowserRouter,
  createMemoryRouter,
  type InitialEntry,
} from 'react-router-dom';

import { routes } from './routes';

export function createAppRouter() {
  return createBrowserRouter(routes);
}

export function createTestRouter(initialEntries: InitialEntry[]) {
  return createMemoryRouter(routes, { initialEntries });
}
