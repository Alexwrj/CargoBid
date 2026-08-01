import { useQuery } from '@tanstack/react-query';
import { getRouteApi, useRouter } from '@tanstack/react-router';

import { auctionDetailQueryOptions } from '@/entities/auction/api/auction-detail-query';
import { presentAuctionDetailError } from '@/entities/auction/model/auction-detail-error';
import {
  presentAuctionDetail,
  type AuctionDetailFact,
} from '@/entities/auction/model/auction-detail-presenter';
import { Badge } from '@/shared/ui/badge/Badge';
import { Button } from '@/shared/ui/button/Button';
import { Skeleton } from '@/shared/ui/skeleton/Skeleton';
import { EmptyState, ErrorState } from '@/shared/ui/state-message/StateMessage';

import styles from './AuctionDetailsPage.module.scss';

const routeApi = getRouteApi('/auctions/$auctionUuid');

function BackToAuctions({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  const handleBack = () => {
    if (router.history.canGoBack()) {
      router.history.back();
      return;
    }

    void router.navigate({ search: {}, to: '/auctions' });
  };

  return (
    <button
      className={compact ? styles.stateLink : styles.backLink}
      onClick={handleBack}
      type="button"
    >
      {compact ? 'Вернуться к аукционам' : '← Вернуться к аукционам'}
    </button>
  );
}

function Facts({ facts }: { facts: AuctionDetailFact[] }) {
  if (facts.length === 0) return null;

  return (
    <dl className={styles.facts}>
      {facts.map((fact) => (
        <div className={styles.fact} key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Загрузка данных аукциона"
      className={styles.skeleton}
    >
      <div className={styles.skeletonHeader}>
        <Skeleton height="1rem" width="10rem" />
        <Skeleton height="3rem" width="24rem" />
        <Skeleton height="2rem" width="18rem" />
      </div>
      <div className={styles.skeletonGrid}>
        <div className={styles.skeletonSections}>
          <Skeleton height="16rem" />
          <Skeleton height="12rem" />
        </div>
        <Skeleton height="24rem" />
      </div>
    </div>
  );
}

export function AuctionDetailsPage() {
  const { auctionUuid } = routeApi.useParams();
  const auctionQuery = useQuery(auctionDetailQueryOptions(auctionUuid));
  const errorView = presentAuctionDetailError(auctionQuery.error);

  if (auctionQuery.isPending) {
    return <DetailSkeleton />;
  }

  if (auctionQuery.isError) {
    return (
      <section className={styles.page}>
        <BackToAuctions />
        <h1 className={styles.stateTitle}>Детали аукциона</h1>
        {errorView.isNotFound ? (
          <EmptyState
            action={<BackToAuctions compact />}
            description={errorView.description}
            icon="⌕"
            title="Аукцион не найден"
          />
        ) : (
          <ErrorState
            action={
              <div className={styles.stateActions}>
                <Button onClick={() => void auctionQuery.refetch()}>
                  Повторить
                </Button>
                <BackToAuctions compact />
              </div>
            }
            description={errorView.description}
            icon="!"
            title="Не удалось загрузить аукцион"
          />
        )}
        {errorView.traceId ? (
          <p className={styles.traceId}>Request ID: {errorView.traceId}</p>
        ) : null}
      </section>
    );
  }

  const auction = presentAuctionDetail(auctionQuery.data);

  return (
    <article className={styles.page}>
      <BackToAuctions />

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Грузовые торги</p>
          <h1 className={styles.title}>Аукцион № {auction.reference}</h1>
          <p className={styles.auctionType}>{auction.auctionType}</p>
        </div>
        <div className={styles.statusSummary}>
          <div className={styles.statusItem}>
            <span>Состояние аукциона</span>
            <Badge tone={auction.auctionStatus.tone}>
              {auction.auctionStatus.label}
            </Badge>
          </div>
          <div className={styles.statusItem}>
            <span>Ваше положение</span>
            <Badge tone={auction.userStatus.tone}>
              {auction.userStatus.label}
            </Badge>
          </div>
        </div>
      </header>

      <div className={styles.contentGrid}>
        <div className={styles.sections}>
          {auction.routePoints.length > 0 ? (
            <section className={styles.section}>
              <h2>Маршрут</h2>
              <ol aria-label="Точки маршрута" className={styles.routeList}>
                {auction.routePoints.map((point) => (
                  <li className={styles.routePoint} key={point.id}>
                    <div className={styles.routeMarker} aria-hidden="true" />
                    <div className={styles.routeContent}>
                      <div className={styles.routeHeading}>
                        <h3>{point.operation}</h3>
                        {point.period ? <time>{point.period}</time> : null}
                      </div>
                      {point.city ? (
                        <strong className={styles.routeCity}>
                          {point.city}
                        </strong>
                      ) : null}
                      {point.address ? <p>{point.address}</p> : null}
                      <Facts facts={point.cargoFacts} />
                      {point.comment ? (
                        <p className={styles.comment}>{point.comment}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {auction.cargoTitle || auction.cargoFacts.length > 0 ? (
            <section className={styles.section}>
              <h2>Груз и транспорт</h2>
              {auction.cargoTitle ? (
                <p className={styles.sectionLead}>{auction.cargoTitle}</p>
              ) : null}
              <Facts facts={auction.cargoFacts} />
            </section>
          ) : null}

          {auction.organizerFacts.length > 0 ||
          auction.paymentFacts.length > 0 ||
          auction.createdAt ? (
            <section className={styles.section}>
              <h2>Дополнительная информация</h2>
              {auction.organizerFacts.length > 0 ? (
                <div className={styles.subsection}>
                  <h3>Организатор</h3>
                  <Facts facts={auction.organizerFacts} />
                </div>
              ) : null}
              {auction.paymentFacts.length > 0 ? (
                <div className={styles.subsection}>
                  <h3>Оплата</h3>
                  <Facts facts={auction.paymentFacts} />
                </div>
              ) : null}
              {auction.createdAt ? (
                <p className={styles.createdAt}>Создан: {auction.createdAt}</p>
              ) : null}
            </section>
          ) : null}
        </div>

        <aside className={styles.tradeSummary} aria-labelledby="trade-title">
          <h2 id="trade-title">Торги</h2>
          <div className={styles.tradeDeadline}>
            <span>До конца торгов</span>
            <strong>{auction.endTime}</strong>
          </div>
          <Facts facts={auction.tradeFacts} />
        </aside>
      </div>
    </article>
  );
}
