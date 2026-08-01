import { useQuery } from '@tanstack/react-query';

import { auctionBidHistoryQueryOptions } from '@/entities/auction/api/auction-bid-history-query';
import { presentAuctionBidHistory } from '@/entities/auction/model/auction-bid-history-presenter';
import { HttpError } from '@/shared/api/api-error';
import { Badge } from '@/shared/ui/badge/Badge';
import { Button } from '@/shared/ui/button/Button';
import { Skeleton } from '@/shared/ui/skeleton/Skeleton';
import { EmptyState, ErrorState } from '@/shared/ui/state-message/StateMessage';

import styles from './AuctionBidHistorySection.module.scss';

interface AuctionBidHistorySectionProps {
  auctionUuid: string;
  currencyCode: string;
}

function getTraceId(error: unknown) {
  if (!(error instanceof HttpError) || !error.body) return undefined;
  if (typeof error.body !== 'object') return undefined;

  const traceId = (error.body as { trace_id?: unknown }).trace_id;

  return typeof traceId === 'string' ? traceId : undefined;
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
    const traceId = getTraceId(historyQuery.error);

    return (
      <section className={styles.section}>
        <h2>История ставок</h2>
        <ErrorState
          action={
            <Button onClick={() => void historyQuery.refetch()}>
              Попробовать снова
            </Button>
          }
          description="Основные данные аукциона доступны. Повторите загрузку истории."
          title="Не удалось загрузить историю ставок"
        />
        {traceId ? (
          <p className={styles.traceId}>Request ID: {traceId}</p>
        ) : null}
      </section>
    );
  }

  const history = presentAuctionBidHistory(historyQuery.data, currencyCode);

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
              <tr key={bet.id}>
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
