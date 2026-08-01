import { getRouteApi } from '@tanstack/react-router';

import { PageContainer } from '@/shared/ui/page-container/PageContainer';

const routeApi = getRouteApi('/auctions/$auctionUuid');

export function AuctionDetailsPage() {
  const { auctionUuid } = routeApi.useParams();

  return (
    <PageContainer
      eyebrow="Маршрут /auctions/:auctionUuid"
      title="Детали аукциона"
    >
      <p>
        Идентификатор аукциона: <code>{auctionUuid}</code>
      </p>
    </PageContainer>
  );
}
