import type { ListBetsResponse } from '@/shared/api/generated/auctions/bets/listBets';
import { formatDateTime, formatMoney } from '@/shared/utils/formatters';

export interface AuctionBidHistoryStatus {
  label: string;
  tone: 'danger' | 'info' | 'success';
}

export interface AuctionBidHistoryItemView {
  amount?: string;
  dateTime?: string;
  displayTime?: string;
  id: string;
  isOwn: boolean;
  participant: string;
  statuses: AuctionBidHistoryStatus[];
  vatLabel?: string;
}

function getAmount(
  bet: ListBetsResponse['bets'][number],
  currencyCode: string,
) {
  const priceWithVat =
    bet.price_with_vat ?? bet.price_info?.price_with_vat ?? undefined;
  const priceWithoutVat =
    bet.price_no_vat ?? bet.price_info?.price_no_vat ?? undefined;

  if (priceWithVat != null) {
    return {
      amount: formatMoney(priceWithVat, currencyCode),
      vatLabel: 'с НДС',
    };
  }

  if (priceWithoutVat != null) {
    return {
      amount: formatMoney(priceWithoutVat, currencyCode),
      vatLabel: 'без НДС',
    };
  }

  return {};
}

function getStatuses(
  bet: ListBetsResponse['bets'][number],
  isOwn: boolean,
): AuctionBidHistoryStatus[] {
  const statuses: AuctionBidHistoryStatus[] = [];

  if (isOwn) statuses.push({ label: 'Ваша', tone: 'success' });
  if (bet.is_win) statuses.push({ label: 'Победившая', tone: 'success' });
  if (bet.is_counter) statuses.push({ label: 'Встречная', tone: 'info' });
  if (bet.is_rejected) statuses.push({ label: 'Отклонена', tone: 'danger' });

  return statuses;
}

export function presentAuctionBidHistory(
  response: ListBetsResponse,
  currencyCode: string,
  ownBidAmount?: number,
): AuctionBidHistoryItemView[] {
  return response.bets.map((bet, index) => {
    const amount =
      bet.price_with_vat ??
      bet.price_info?.price_with_vat ??
      bet.price_no_vat ??
      bet.price_info?.price_no_vat;
    const isOwn =
      ownBidAmount !== undefined &&
      amount != null &&
      Math.round(amount * 100) === Math.round(ownBidAmount * 100);

    return {
      ...getAmount(bet, currencyCode),
      dateTime: bet.created_at,
      displayTime: bet.created_at ? formatDateTime(bet.created_at) : undefined,
      id: bet.id === undefined ? `bet-${index}` : String(bet.id),
      isOwn,
      participant:
        bet.organization_name?.trim() ||
        bet.contact_name?.trim() ||
        'Участник не указан',
      statuses: getStatuses(bet, isOwn),
    };
  });
}
