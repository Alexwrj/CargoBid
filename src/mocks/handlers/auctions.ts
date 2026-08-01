import { http, HttpResponse } from 'msw';

import {
  auctionBetsFixture,
  auctionFixture,
  auctionListFixture,
} from '@/mocks/data/auction-contract-fixtures';

const auctionApiUrl = '*/api/v1/auctions';

export const auctionHandlers = [
  http.post(`${auctionApiUrl}/list`, () => {
    return HttpResponse.json(auctionListFixture);
  }),
  http.get(`${auctionApiUrl}/:auctionUuid`, () => {
    return HttpResponse.json(auctionFixture);
  }),
  http.get(`${auctionApiUrl}/:auctionUuid/bets`, () => {
    return HttpResponse.json(auctionBetsFixture);
  }),
  http.post(`${auctionApiUrl}/:auctionUuid/bets`, () => {
    return new HttpResponse(null, { status: 200 });
  }),
];
