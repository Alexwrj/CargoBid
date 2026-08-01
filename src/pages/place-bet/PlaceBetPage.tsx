import { getRouteApi } from '@tanstack/react-router';

import { PageContainer } from '@/shared/ui/page-container/PageContainer';

const routeApi = getRouteApi('/auctions/$auctionUuid/bet');

export function PlaceBetPage() {
  const { auctionUuid } = routeApi.useParams();

  return (
    <PageContainer
      eyebrow="Маршрут /auctions/:auctionUuid/bet"
      title="Установка ставки"
    >
      <p>
        Форма ставки для аукциона <code>{auctionUuid}</code> будет реализована
        на следующем этапе.
      </p>
    </PageContainer>
  );
}
