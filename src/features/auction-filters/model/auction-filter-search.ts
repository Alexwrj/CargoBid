import { z } from 'zod';

import {
  auctionStatusIds,
  filterableAuctionStatuses,
} from '@/entities/auction/model/auction-status';
import type { ListAuctionsRequestBody } from '@/shared/api/generated/auctions/list/listAuctions';

const userStatuses = [
  'NotParticipating',
  'Leading',
  'Losing',
  'Confirmed',
  'Winner',
] as const;

function optionalString() {
  return z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() !== ''
        ? value.trim()
        : undefined,
    z.string().optional(),
  );
}

function optionalNonNegativeNumber() {
  return z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) return undefined;

    const number = typeof value === 'number' ? value : Number(value);

    return Number.isFinite(number) && number >= 0 ? number : undefined;
  }, z.number().nonnegative().optional());
}

function optionalPositiveInteger() {
  return z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) return undefined;

    const number = typeof value === 'number' ? value : Number(value);

    return Number.isInteger(number) && number > 0 ? number : undefined;
  }, z.number().int().positive().optional());
}

function optionalBoolean() {
  return z.preprocess((value) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;

    return undefined;
  }, z.boolean().optional());
}

export const auctionFilterSearchSchema = z.object({
  auctionStatus: z.enum(filterableAuctionStatuses).optional().catch(undefined),
  bodyType: optionalString(),
  cargoNum: optionalString(),
  isAvailable: optionalBoolean(),
  loadCity: optionalString(),
  page: optionalPositiveInteger(),
  unloadCity: optionalString(),
  userStatus: z.enum(userStatuses).optional().catch(undefined),
  weightFrom: optionalNonNegativeNumber(),
  weightTo: optionalNonNegativeNumber(),
});

export type AuctionFilterSearch = z.infer<typeof auctionFilterSearchSchema>;

export const auctionFilterFormSchema = z
  .object({
    auctionStatus: z.union([z.literal(''), z.enum(filterableAuctionStatuses)]),
    bodyType: z.string(),
    cargoNum: z.string(),
    isAvailable: z.union([
      z.literal(''),
      z.literal('false'),
      z.literal('true'),
    ]),
    loadCity: z.string(),
    unloadCity: z.string(),
    userStatus: z.union([z.literal(''), z.enum(userStatuses)]),
    weightFrom: z.number().nonnegative().nullable(),
    weightTo: z.number().nonnegative().nullable(),
  })
  .superRefine(({ weightFrom, weightTo }, context) => {
    if (weightFrom !== null && weightTo !== null && weightTo < weightFrom) {
      context.addIssue({
        code: 'custom',
        message: 'Максимальный вес должен быть не меньше минимального',
        path: ['weightTo'],
      });
    }
  });

export type AuctionFilterFormValues = z.infer<typeof auctionFilterFormSchema>;

export const auctionsPerPage = 6;

export function areAuctionFilterSearchEqual(
  left: AuctionFilterSearch,
  right: AuctionFilterSearch,
) {
  return (
    left.auctionStatus === right.auctionStatus &&
    left.bodyType === right.bodyType &&
    left.cargoNum === right.cargoNum &&
    left.isAvailable === right.isAvailable &&
    left.loadCity === right.loadCity &&
    left.page === right.page &&
    left.unloadCity === right.unloadCity &&
    left.userStatus === right.userStatus &&
    left.weightFrom === right.weightFrom &&
    left.weightTo === right.weightTo
  );
}

export function searchToAuctionListRequest(
  search: AuctionFilterSearch,
): ListAuctionsRequestBody {
  return {
    page: search.page ?? 1,
    per_page: auctionsPerPage,
    ...(search.auctionStatus
      ? { statuses: [auctionStatusIds[search.auctionStatus]] }
      : {}),
    ...(search.bodyType ? { body_types: [search.bodyType] } : {}),
    ...(search.cargoNum ? { cargo_num: search.cargoNum } : {}),
    ...(search.isAvailable === undefined
      ? {}
      : { is_available: search.isAvailable }),
    ...(search.loadCity ? { load_city: search.loadCity } : {}),
    ...(search.unloadCity ? { unload_city: search.unloadCity } : {}),
    ...(search.userStatus ? { status: [search.userStatus] } : {}),
    ...(search.weightFrom === undefined
      ? {}
      : { weight_from: search.weightFrom }),
    ...(search.weightTo === undefined ? {} : { weight_to: search.weightTo }),
  };
}

export function searchToFilterFormValues(
  search: AuctionFilterSearch,
): AuctionFilterFormValues {
  return {
    auctionStatus: search.auctionStatus ?? '',
    bodyType: search.bodyType ?? '',
    cargoNum: search.cargoNum ?? '',
    isAvailable:
      search.isAvailable === undefined
        ? ''
        : search.isAvailable
          ? 'true'
          : 'false',
    loadCity: search.loadCity ?? '',
    unloadCity: search.unloadCity ?? '',
    userStatus: search.userStatus ?? '',
    weightFrom: search.weightFrom ?? null,
    weightTo: search.weightTo ?? null,
  };
}

export function filterFormValuesToSearch(
  values: AuctionFilterFormValues,
): AuctionFilterSearch {
  return auctionFilterSearchSchema.parse({
    auctionStatus: values.auctionStatus,
    bodyType: values.bodyType,
    cargoNum: values.cargoNum,
    isAvailable: values.isAvailable,
    loadCity: values.loadCity,
    unloadCity: values.unloadCity,
    userStatus: values.userStatus,
    weightFrom: values.weightFrom,
    weightTo: values.weightTo,
  });
}
