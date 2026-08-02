const currencyByNumericCode: Record<string, string> = {
  '643': 'RUB',
  '840': 'USD',
  '978': 'EUR',
};

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
});

export function formatNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits,
  }).format(value);
}

export function formatMoney(value: number, numericCurrencyCode = '643') {
  const currency = currencyByNumericCode[numericCurrencyCode];

  if (!currency) {
    return `${formatNumber(value, 0)} ${numericCurrencyCode}`;
  }

  return new Intl.NumberFormat('ru-RU', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

export function formatDateTime(value?: string) {
  if (!value) return 'Дата не указана';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 'Дата не указана'
    : dateTimeFormatter.format(date);
}

export function formatTimeUntil(value?: string, now = Date.now()) {
  if (!value) return 'Срок не указан';

  const endTime = new Date(value).getTime();

  if (Number.isNaN(endTime)) return 'Срок не указан';

  const remainingMinutes = Math.ceil((endTime - now) / 60_000);

  if (remainingMinutes <= 0) return `Завершено ${formatDateTime(value)}`;
  if (remainingMinutes < 60) return `Осталось ${remainingMinutes} мин`;

  if (remainingMinutes < 24 * 60) {
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;

    return minutes > 0
      ? `Осталось ${hours} ч ${minutes} мин`
      : `Осталось ${hours} ч`;
  }

  return `До ${formatDateTime(value)}`;
}

export function formatUnit(value: number, unit: string) {
  return `${formatNumber(value)} ${unit}`;
}
