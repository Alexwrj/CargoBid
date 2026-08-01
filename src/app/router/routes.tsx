import {
  createRootRoute,
  createRoute,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router';

import { LoadingFallback } from '@/shared/ui/loading-fallback/LoadingFallback';

import { AppLayout } from './AppLayout';
import { RouteErrorPage } from './RouteErrorPage';

const rootRoute = createRootRoute({
  component: AppLayout,
  errorComponent: RouteErrorPage,
  notFoundComponent: lazyRouteComponent(
    () => import('@/pages/not-found/NotFoundPage'),
    'NotFoundPage',
  ),
  pendingComponent: LoadingFallback,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    redirect({ throw: true, to: '/auctions' });
  },
});

const auctionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions',
  component: lazyRouteComponent(
    () => import('@/pages/auctions/AuctionsPage'),
    'AuctionsPage',
  ),
});

const auctionDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions/$auctionUuid',
  component: lazyRouteComponent(
    () => import('@/pages/auction-details/AuctionDetailsPage'),
    'AuctionDetailsPage',
  ),
});

const placeBetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions/$auctionUuid/bet',
  component: lazyRouteComponent(
    () => import('@/pages/place-bet/PlaceBetPage'),
    'PlaceBetPage',
  ),
});

const uiKitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ui-kit',
  component: lazyRouteComponent(
    () => import('@/pages/ui-kit/UiKitPage'),
    'UiKitPage',
  ),
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  auctionsRoute,
  auctionDetailsRoute,
  placeBetRoute,
  ...(import.meta.env.DEV ? [uiKitRoute] : []),
]);
