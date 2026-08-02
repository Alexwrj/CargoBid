import classNames from 'classnames';
import { useState } from 'react';

import { usePlaceAuctionBid } from '@/features/place-auction-bid/api/use-place-auction-bid';
import { presentPlaceAuctionBidError } from '@/features/place-auction-bid/model/place-auction-bid-error';
import { formatMoney } from '@/shared/utils/formatters';
import { Button } from '@/shared/ui/button/Button';

import styles from './AcceptFixedPrice.module.scss';

interface AcceptFixedPriceProps {
  auctionUuid: string;
  currencyCode: string;
  price: number;
}

export function AcceptFixedPrice({
  auctionUuid,
  currencyCode,
  price,
}: AcceptFixedPriceProps) {
  const [isSubmissionLocked, setIsSubmissionLocked] = useState(false);
  const mutation = usePlaceAuctionBid(auctionUuid);
  const errorView = mutation.isError
    ? presentPlaceAuctionBidError(mutation.error)
    : undefined;

  const acceptPrice = async () => {
    if (isSubmissionLocked) return;

    setIsSubmissionLocked(true);
    mutation.reset();

    try {
      await mutation.mutateAsync({ price });
    } catch {
      // Error presentation belongs to the mutation state.
    } finally {
      setIsSubmissionLocked(false);
    }
  };

  return (
    <div className={styles.action}>
      <p className={styles.description}>
        Принять предложение за {formatMoney(price, currencyCode)}
      </p>
      <Button
        aria-busy={mutation.isPending}
        disabled={isSubmissionLocked || mutation.isPending}
        fullWidth
        isLoading={mutation.isPending}
        loadingLabel="Принимаем цену…"
        onClick={() => void acceptPrice()}
      >
        Принять цену
      </Button>

      {errorView ? (
        <p className={classNames(styles.feedback, styles.error)} role="alert">
          {errorView.description}
          {errorView.traceId ? (
            <span className={styles.traceId}>
              Request ID: {errorView.traceId}
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
