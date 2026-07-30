import { useParams } from 'react-router-dom';

import { PageContainer } from '@/shared/ui/page-container/PageContainer';

export function AuctionDetailsPage() {
  const { auctionUuid } = useParams<'auctionUuid'>();

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
