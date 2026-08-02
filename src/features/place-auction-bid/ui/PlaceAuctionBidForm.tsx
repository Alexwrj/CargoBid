import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { auctionKeys } from '@/entities/auction/api/auction-keys';
import { presentPlaceAuctionBidError } from '@/features/place-auction-bid/model/place-auction-bid-error';
import {
  createPlaceAuctionBidSchema,
  type PlaceAuctionBidFormInput,
  type PlaceAuctionBidFormOutput,
} from '@/features/place-auction-bid/model/place-auction-bid-schema';
import {
  setBet,
  type SetBetRequestBody,
} from '@/shared/api/generated/auctions/bets/setBet';
import { formatMoney } from '@/shared/lib/formatters';
import { Button } from '@/shared/ui/button/Button';
import { TextField } from '@/shared/ui/text-field/TextField';

import styles from './PlaceAuctionBidForm.module.scss';

interface PlaceAuctionBidFormProps {
  auctionUuid: string;
  currencyCode: string;
  max?: number | null;
  min?: number | null;
  step?: number | null;
}

function getDescription({
  currencyCode,
  max,
  min,
  step,
}: Omit<PlaceAuctionBidFormProps, 'auctionUuid'>) {
  const parts: string[] = [];

  if (min != null && max != null && min === max) {
    parts.push(`Допустимая сумма: ${formatMoney(min, currencyCode)}`);
  } else {
    if (min != null) parts.push(`От ${formatMoney(min, currencyCode)}`);
    if (max != null) parts.push(`До ${formatMoney(max, currencyCode)}`);
  }

  if (step != null) {
    parts.push(`Указанный сервером шаг: ${formatMoney(step, currencyCode)}`);
  }

  return parts.join('. ') || undefined;
}

export function PlaceAuctionBidForm({
  auctionUuid,
  currencyCode,
  max,
  min,
  step,
}: PlaceAuctionBidFormProps) {
  const queryClient = useQueryClient();
  const [isSubmissionLocked, setIsSubmissionLocked] = useState(false);
  const schema = useMemo(
    () => createPlaceAuctionBidSchema({ currencyCode, max, min }),
    [currencyCode, max, min],
  );
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<PlaceAuctionBidFormInput, unknown, PlaceAuctionBidFormOutput>({
    defaultValues: { amount: '' },
    resolver: zodResolver(schema),
  });

  const refreshAuction = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        exact: true,
        queryKey: auctionKeys.detail(auctionUuid),
      }),
      queryClient.invalidateQueries({
        exact: true,
        queryKey: auctionKeys.bets(auctionUuid),
      }),
      queryClient.invalidateQueries({ queryKey: auctionKeys.lists() }),
    ]);
  };

  const mutation = useMutation({
    mutationFn: (body: SetBetRequestBody) => setBet({ auctionUuid, body }),
    onError: async (error) => {
      if (presentPlaceAuctionBidError(error).shouldRefresh) {
        await refreshAuction();
      }
    },
    onSuccess: refreshAuction,
  });
  const errorView = mutation.isError
    ? presentPlaceAuctionBidError(mutation.error)
    : undefined;
  const description = getDescription({ currencyCode, max, min, step });

  const submit = handleSubmit(async ({ amount }) => {
    if (isSubmissionLocked) return;

    setIsSubmissionLocked(true);
    mutation.reset();

    try {
      await mutation.mutateAsync({ price: amount });
      reset({ amount: '' });
    } catch {
      // Error presentation belongs to the mutation state.
    } finally {
      setIsSubmissionLocked(false);
    }
  });

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      <TextField
        {...register('amount')}
        autoComplete="off"
        description={description}
        disabled={mutation.isPending}
        endAdornment={currencyCode === '643' ? '₽' : currencyCode}
        error={errors.amount?.message}
        inputMode="decimal"
        label="Сумма ставки"
        placeholder="Введите сумму"
      />

      <Button
        aria-busy={mutation.isPending}
        disabled={isSubmitting || isSubmissionLocked || mutation.isPending}
        fullWidth
        isLoading={mutation.isPending}
        loadingLabel="Отправляем ставку…"
        type="submit"
      >
        Сделать ставку
      </Button>

      {mutation.isSuccess ? (
        <p
          aria-live="polite"
          className={classNames(styles.feedback, styles.success)}
          role="status"
        >
          Ставка принята
        </p>
      ) : null}

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
    </form>
  );
}
