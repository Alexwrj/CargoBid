import { redirect, type RouteObject } from 'react-router-dom';

import { LoadingFallback } from '@/shared/ui/loading-fallback/LoadingFallback';

import { AppLayout } from './AppLayout';
import { RouteErrorPage } from './RouteErrorPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    HydrateFallback: LoadingFallback,
    children: [
      {
        index: true,
        loader: () => redirect('/auctions'),
      },
      {
        path: 'auctions',
        lazy: async () => {
          const { AuctionsPage } =
            await import('@/pages/auctions/AuctionsPage');

          return { Component: AuctionsPage };
        },
      },
      {
        path: 'auctions/:auctionUuid',
        lazy: async () => {
          const { AuctionDetailsPage } =
            await import('@/pages/auction-details/AuctionDetailsPage');

          return { Component: AuctionDetailsPage };
        },
      },
      {
        path: 'auctions/:auctionUuid/bet',
        lazy: async () => {
          const { PlaceBetPage } =
            await import('@/pages/place-bet/PlaceBetPage');

          return { Component: PlaceBetPage };
        },
      },
      {
        path: '*',
        lazy: async () => {
          const { NotFoundPage } =
            await import('@/pages/not-found/NotFoundPage');

          return { Component: NotFoundPage };
        },
      },
    ],
  },
];
