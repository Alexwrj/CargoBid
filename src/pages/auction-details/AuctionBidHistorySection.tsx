import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';

import { auctionBidHistoryQueryOptions } from '@/entities/auction/api/auction-bid-history-query';
import { presentAuctionBidHistoryError } from '@/entities/auction/model/auction-bid-history-error';
import { presentAuctionBidHistory } from '@/entities/auction/model/auction-bid-history-presenter';
import { Badge } from '@/shared/ui/badge/Badge';
import { Button } from '@/shared/ui/button/Button';
import { Skeleton } from '@/shared/ui/skeleton/Skeleton';
import { EmptyState, ErrorState } from '@/shared/ui/state-message/StateMessage';

import styles from './AuctionBidHistorySection.module.scss';

interface AuctionBidHistorySectionProps {
  auctionUuid: string;
  currencyCode: string;
  ownBidAmount?: number;
}

function HistorySkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Загрузка истории ставок"
      className={styles.skeleton}
    >
      <Skeleton height="2.5rem" />
      <Skeleton height="2.5rem" />
      <Skeleton height="2.5rem" />
    </div>
  );
}

export function AuctionBidHistorySection({
  auctionUuid,
  currencyCode,
  ownBidAmount,
}: AuctionBidHistorySectionProps) {
  const historyQuery = useQuery(auctionBidHistoryQueryOptions(auctionUuid));

  if (historyQuery.isPending) {
    return (
      <section className={styles.section}>
        <h2>История ставок</h2>
        <HistorySkeleton />
      </section>
    );
  }

  if (historyQuery.isError) {
    const errorView = presentAuctionBidHistoryError(historyQuery.error);

    return (
      <section className={styles.section}>
        <h2>История ставок</h2>
        <ErrorState
          action={
            <Button onClick={() => void historyQuery.refetch()}>
              Попробовать снова
            </Button>
          }
          description={errorView.description}
          title="Не удалось загрузить историю ставок"
        />
        {errorView.traceId ? (
          <p className={styles.traceId}>Request ID: {errorView.traceId}</p>
        ) : null}
      </section>
    );
  }

  const history = presentAuctionBidHistory(
    historyQuery.data,
    currencyCode,
    ownBidAmount,
  );

  if (history.length === 0) {
    return (
      <section className={styles.section}>
        <h2>История ставок</h2>
        <EmptyState
          description="Участники ещё не сделали ни одной ставки."
          icon="₽"
          title="Ставок пока нет"
        />
      </section>
    );
  }

  const hasStatuses = history.some((bet) => bet.statuses.length > 0);

  return (
    <section className={styles.section}>
      <h2>История ставок</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Участник</th>
              <th scope="col">Ставка</th>
              <th scope="col">Время</th>
              {hasStatuses ? <th scope="col">Статус</th> : null}
            </tr>
          </thead>
          <tbody>
            {history.map((bet) => (
              <tr
                className={classNames(bet.isOwn && styles.ownBid)}
                data-own-bid={bet.isOwn || undefined}
                key={bet.id}
              >
                <td data-label="Участник">{bet.participant}</td>
                <td data-label="Ставка">
                  {bet.amount ? (
                    <span className={styles.amount}>
                      <strong>{bet.amount}</strong>
                      {bet.vatLabel ? <small>{bet.vatLabel}</small> : null}
                    </span>
                  ) : null}
                </td>
                <td data-label="Время">
                  {bet.displayTime ? (
                    <time dateTime={bet.dateTime}>{bet.displayTime}</time>
                  ) : null}
                </td>
                {hasStatuses ? (
                  <td data-label="Статус">
                    {bet.statuses.length > 0 ? (
                      <span className={styles.statuses}>
                        {bet.statuses.map((status) => (
                          <Badge key={status.label} tone={status.tone}>
                            {status.label}
                          </Badge>
                        ))}
                      </span>
                    ) : null}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
