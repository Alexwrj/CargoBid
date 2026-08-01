import { delay, http, HttpResponse } from 'msw';

import {
  auctionBetsFixture,
  auctionFixture,
  auctionListStore,
} from '@/mocks/data/auction-contract-fixtures';
import type { ListAuctionsRequestBody } from '@/shared/api/generated/auctions/list/listAuctions';
import type { components } from '@/shared/api/generated/types';

const auctionApiUrl = '*/api/v1/auctions';

type AuctionListItem = components['schemas']['AuctionListItem'];
type AuctionListResponse = components['schemas']['AuctionListResponseBase'];
type ProblemDetail = components['schemas']['ProblemDetail'];

interface AuctionListHandlerOptions {
  items?: AuctionListItem[];
  responseDelay?: number | 'infinite';
  scenario?: 'success' | 'empty' | 'error';
}

async function readListRequest(request: Request) {
  const body = await request.text();

  return body ? (JSON.parse(body) as ListAuctionsRequestBody) : {};
}

export function createAuctionListHandler({
  items = auctionListStore.items,
  responseDelay,
  scenario = 'success',
}: AuctionListHandlerOptions = {}) {
  return http.post(`${auctionApiUrl}/list`, async ({ request }) => {
    if (responseDelay !== undefined) {
      await delay(responseDelay);
    }

    if (scenario === 'error') {
      return HttpResponse.json(
        {
          code: 'auction_list_unavailable',
          title: 'Сервис временно недоступен',
          message: 'Не удалось загрузить список аукционов',
          trace_id: 'trace-auction-list-503',
        } satisfies ProblemDetail,
        { status: 503 },
      );
    }

    const requestBody = await readListRequest(request);
    const page = requestBody.page ?? 1;
    const perPage = requestBody.per_page ?? 20;
    const availableItems = scenario === 'empty' ? [] : items;
    const total = availableItems.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const offset = (page - 1) * perPage;
    const data = availableItems.slice(offset, offset + perPage);
    const from = data.length > 0 ? offset + 1 : 0;
    const to = data.length > 0 ? offset + data.length : 0;

    return HttpResponse.json({
      data,
      meta: {
        current_page: page,
        from,
        last_page: lastPage,
        per_page: perPage,
        to,
        total,
      },
    } satisfies AuctionListResponse);
  });
}

export const auctionHandlers = [
  createAuctionListHandler(),
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
