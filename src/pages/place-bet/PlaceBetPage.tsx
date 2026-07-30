import { useParams } from 'react-router-dom';

import { PageContainer } from '@/shared/ui/page-container/PageContainer';

export function PlaceBetPage() {
  const { auctionUuid } = useParams<'auctionUuid'>();

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
