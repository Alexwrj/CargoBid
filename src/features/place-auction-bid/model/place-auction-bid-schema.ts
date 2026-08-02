import { z } from 'zod';

import { formatMoney } from '@/shared/utils/formatters';

interface PlaceAuctionBidSchemaOptions {
  currencyCode: string;
  max?: number | null;
  min?: number | null;
}

function parseAmount(value: string, context: z.RefinementCtx) {
  const normalizedValue = value
    .trim()
    .replace(/[\s\u00a0\u202f]/g, '')
    .replace(',', '.');

  if (!/^\d+(?:\.\d+)?$/.test(normalizedValue)) {
    context.addIssue({
      code: 'custom',
      message: 'Введите сумму числом без букв и специальных символов',
    });

    return z.NEVER;
  }

  const amount = Number(normalizedValue);

  if (!Number.isFinite(amount)) {
    context.addIssue({
      code: 'custom',
      message: 'Введите корректную сумму ставки',
    });

    return z.NEVER;
  }

  return amount;
}

export function createPlaceAuctionBidSchema({
  currencyCode,
  max,
  min,
}: PlaceAuctionBidSchemaOptions) {
  let amountSchema = z
    .string()
    .trim()
    .min(1, 'Введите сумму ставки')
    .transform(parseAmount)
    .pipe(z.number().positive('Сумма должна быть больше нуля'));

  if (min != null) {
    amountSchema = amountSchema.refine((amount) => amount >= min, {
      message: `Сумма должна быть не меньше ${formatMoney(min, currencyCode)}`,
    });
  }

  if (max != null) {
    amountSchema = amountSchema.refine((amount) => amount <= max, {
      message: `Сумма должна быть не больше ${formatMoney(max, currencyCode)}`,
    });
  }

  return z.object({ amount: amountSchema });
}

export type PlaceAuctionBidFormInput = z.input<
  ReturnType<typeof createPlaceAuctionBidSchema>
>;

export type PlaceAuctionBidFormOutput = z.output<
  ReturnType<typeof createPlaceAuctionBidSchema>
>;
