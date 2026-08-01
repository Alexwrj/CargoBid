import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { auctionListQueryOptions } from '@/entities/auction/api/auction-list-query';
import { presentAuctionListError } from '@/entities/auction/model/auction-list-error';
import { presentAuctionListItem } from '@/entities/auction/model/auction-list-presenter';
import { AuctionListCard } from '@/entities/auction/ui/AuctionListCard';
import { Button } from '@/shared/ui/button/Button';
import { Pagination } from '@/shared/ui/pagination/Pagination';
import { Skeleton } from '@/shared/ui/skeleton/Skeleton';
import { EmptyState, ErrorState } from '@/shared/ui/state-message/StateMessage';

import styles from './AuctionsPage.module.scss';

const auctionsPerPage = 6;

function AuctionsListSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Загрузка аукционов"
      className={styles.list}
    >
      {Array.from({ length: auctionsPerPage }, (_, index) => (
        <div className={styles.skeletonCard} key={index}>
          <div className={styles.skeletonSummary}>
            <div className={styles.skeletonRow}>
              <Skeleton height="1.25rem" width="9rem" />
              <Skeleton height="1.25rem" width="7rem" />
            </div>
            <Skeleton height="1.5rem" width="68%" />
            <div className={styles.skeletonRow}>
              <Skeleton height="2.5rem" width="42%" />
              <Skeleton height="2.5rem" width="42%" />
            </div>
            <Skeleton height="2.75rem" />
          </div>
          <div className={styles.skeletonCommercial}>
            <Skeleton height="1rem" width="7rem" />
            <Skeleton height="2rem" width="9rem" />
            <Skeleton height="2.5rem" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AuctionsPage() {
  const [page, setPage] = useState(1);
  const auctionListQuery = useQuery(
    auctionListQueryOptions({ page, per_page: auctionsPerPage }),
  );

  const total = auctionListQuery.data?.meta?.total ?? 0;
  const totalPages = auctionListQuery.data?.meta?.last_page ?? 1;
  const items = auctionListQuery.data?.data ?? [];
  const errorView = presentAuctionListError(auctionListQuery.error);

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Грузовые торги</p>
          <h1 className={styles.title}>Аукционы</h1>
        </div>
        {!auctionListQuery.isPending && !auctionListQuery.isError ? (
          <span className={styles.total}>Найдено: {total}</span>
        ) : null}
      </header>

      {auctionListQuery.isPending ? <AuctionsListSkeleton /> : null}

      {auctionListQuery.isError ? (
        <div className={styles.state}>
          <ErrorState
            action={
              <Button
                onClick={() => {
                  void auctionListQuery.refetch();
                }}
                variant="secondary"
              >
                Повторить
              </Button>
            }
            description={errorView.description}
            icon="!"
            title="Не удалось загрузить аукционы"
          />
          {errorView.traceId ? (
            <p className={styles.traceId}>Request ID: {errorView.traceId}</p>
          ) : null}
        </div>
      ) : null}

      {auctionListQuery.isSuccess && items.length === 0 ? (
        <EmptyState
          description="Попробуйте обновить страницу или изменить параметры поиска."
          icon="⌕"
          title="Аукционы не найдены"
        />
      ) : null}

      {auctionListQuery.isSuccess && items.length > 0 ? (
        <>
          <div
            aria-busy={auctionListQuery.isFetching}
            aria-label="Список аукционов"
            className={styles.list}
          >
            {items.map((item, index) => {
              const auction = presentAuctionListItem(item);
              const key =
                auction.auctionUuid ?? item.main?.id ?? `${page}-${index}`;

              return <AuctionListCard auction={auction} key={key} />;
            })}
          </div>

          {totalPages > 1 ? (
            <div className={styles.pagination}>
              <Pagination
                currentPage={page}
                onPageChange={setPage}
                siblingCount={2}
                totalPages={totalPages}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
