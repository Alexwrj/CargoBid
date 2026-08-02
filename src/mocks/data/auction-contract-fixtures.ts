import type { components } from '@/shared/api/generated/types';

type AuctionListItem = components['schemas']['AuctionListItem'];
type AuctionResponse = components['schemas']['AuctionShowResponse'];
type AuctionBet = components['schemas']['BetItem'];
type RoutePoint = components['schemas']['RoutePoint'];

const fixtureReferenceTime = Date.now();

function dateAfter(minutes: number) {
  return new Date(fixtureReferenceTime + minutes * 60_000).toISOString();
}

const detailSettingsByAuctionUuid = {
  '550e8400-e29b-41d4-a716-446655440001': {
    distance: 1_400,
    max: 28_000,
    min: 20_000,
    step: 500,
  },
  '550e8400-e29b-41d4-a716-446655440002': {
    distance: 1_420,
    max: 100_000,
    min: 62_000,
    step: 1_000,
  },
  '550e8400-e29b-41d4-a716-446655440003': {
    distance: 650,
    max: undefined,
    min: undefined,
    step: 1_000,
  },
  '550e8400-e29b-41d4-a716-446655440004': {
    distance: 780,
    max: undefined,
    min: undefined,
    step: 500,
  },
  '550e8400-e29b-41d4-a716-446655440005': {
    distance: 330,
    max: 43_000,
    min: 43_000,
    step: undefined,
  },
  '550e8400-e29b-41d4-a716-446655440006': {
    distance: 760,
    max: undefined,
    min: undefined,
    step: 1_000,
  },
  '550e8400-e29b-41d4-a716-446655440007': {
    distance: 450,
    max: 100_000,
    min: 42_000,
    step: 1_000,
  },
  '550e8400-e29b-41d4-a716-446655440008': {
    distance: 280,
    max: 71_000,
    min: 60_000,
    step: 500,
  },
} as const;

const organizerInns = [
  '5900000108',
  '5900000115',
  '5900000122',
  '5900000130',
  '5900000147',
  '5900000154',
  '5900000161',
] as const;

function getDetailSettings(auctionUuid: string | undefined) {
  if (!auctionUuid || !(auctionUuid in detailSettingsByAuctionUuid)) {
    throw new Error(`Missing detail fixture settings for ${auctionUuid}`);
  }

  return detailSettingsByAuctionUuid[
    auctionUuid as keyof typeof detailSettingsByAuctionUuid
  ];
}

export const auctionListItems = [
  {
    main: {
      id: 1059,
      cargo_num: 'CB-000001059',
      auc_type: 'Down',
      order_uid: '550e8400-e29b-41d4-a716-446655440001',
      created_at: dateAfter(-180),
      price_per_km: 23_750 / 1_400,
    },
    organizer: { organization_name: 'Северный Вектор' },
    route: {
      load: { city: 'Пермь', date: dateAfter(1_440), points_count: 1 },
      unload: { city: 'Москва', date: dateAfter(2_880), points_count: 1 },
    },
    cargo: {
      name: 'Мороженое',
      weight: 18,
      volume: 82,
      body_type: 'рефрижератор',
      truck_count: 1,
      temp_from: -18,
      temp_to: -16,
    },
    trading: {
      status: 'Auction',
      status_mobile: 'Leading',
      start_time: dateAfter(-45),
      stop_time: dateAfter(12),
      bid_measurement_type: 'PerRoute',
      can_set_bet: true,
      is_bidder: true,
      is_available: true,
      price: { start: 32_000, current: 28_500, current_no_vat: 23_750 },
      your: { bet: true, last_bet: 28_500 },
    },
    payment: { form: 'Безналичная с НДС', currency_code: '643' },
  },
  {
    main: {
      id: 1048,
      cargo_num: 'CB-000001048',
      auc_type: 'Up',
      order_uid: '550e8400-e29b-41d4-a716-446655440002',
      created_at: dateAfter(-240),
      price_per_km: 50_833 / 1_420,
    },
    organizer: { organization_name: 'Логика Пути' },
    route: {
      load: { city: 'Казань', date: dateAfter(2_880), points_count: 1 },
      unload: {
        city: 'Санкт-Петербург',
        date: dateAfter(3_960),
        points_count: 2,
      },
    },
    cargo: {
      name: 'Бытовая техника',
      weight: 12,
      volume: 60,
      body_type: 'тентованный',
      truck_count: 1,
    },
    trading: {
      status: 'Auction',
      status_mobile: 'Losing',
      start_time: dateAfter(-30),
      stop_time: dateAfter(45),
      bid_measurement_type: 'PerRoute',
      can_set_bet: true,
      is_bidder: true,
      is_available: true,
      price: { start: 58_000, current: 61_000, current_no_vat: 50_833 },
      your: { bet: true, last_bet: 60_000 },
    },
    payment: { form: 'Безналичная с НДС', currency_code: '643' },
  },
  {
    main: {
      id: 1033,
      cargo_num: 'CB-000001033',
      auc_type: 'Request',
      order_uid: '550e8400-e29b-41d4-a716-446655440003',
      created_at: dateAfter(-90),
      price_per_km: 28_333 / 650,
    },
    organizer: { organization_name: 'Меридиан Карго' },
    route: {
      load: { city: 'Новосибирск', date: dateAfter(4_320), points_count: 1 },
      unload: { city: 'Омск', date: dateAfter(5_040), points_count: 1 },
    },
    cargo: {
      name: 'Пиломатериалы',
      weight: 20,
      volume: 70,
      body_type: 'бортовой',
      truck_count: 2,
    },
    trading: {
      status: 'Planning',
      status_mobile: 'NotParticipating',
      start_time: dateAfter(240),
      stop_time: dateAfter(360),
      bid_measurement_type: 'PerRoute',
      can_set_bet: false,
      is_bidder: false,
      is_available: false,
      price: { start: 34_000, current: 34_000, current_no_vat: 28_333 },
      your: { bet: false, last_bet: null },
    },
    payment: { form: 'Безналичная с НДС', currency_code: '643' },
  },
  {
    main: {
      id: 1027,
      cargo_num: 'CB-000001027',
      auc_type: 'Down',
      order_uid: '550e8400-e29b-41d4-a716-446655440004',
      created_at: dateAfter(-2_880),
      price_per_km: 39_583 / 780,
    },
    organizer: { organization_name: 'Полярная Линия' },
    route: {
      load: { city: 'Архангельск', date: dateAfter(-1_440), points_count: 1 },
      unload: { city: 'Вологда', date: dateAfter(-840), points_count: 1 },
    },
    cargo: {
      name: 'Бумажная продукция',
      weight: 16,
      volume: 55,
      body_type: 'фургон',
      truck_count: 1,
    },
    trading: {
      status: 'Finished',
      status_mobile: 'Winner',
      start_time: dateAfter(-1_800),
      stop_time: dateAfter(-1_680),
      bid_measurement_type: 'PerRoute',
      can_set_bet: false,
      is_bidder: true,
      is_available: false,
      price: { start: 52_000, current: 47_500, current_no_vat: 39_583 },
      your: { bet: true, last_bet: 47_500 },
    },
    payment: { form: 'Безналичная с НДС', currency_code: '643' },
  },
  {
    main: {
      id: 1019,
      cargo_num: 'CB-000001019',
      auc_type: 'FixPrice',
      order_uid: '550e8400-e29b-41d4-a716-446655440005',
      created_at: dateAfter(-60),
      price_per_km: 35_833 / 330,
    },
    organizer: { organization_name: 'Транзит Лаб' },
    route: {
      load: { city: 'Екатеринбург', date: dateAfter(5_760), points_count: 1 },
      unload: { city: 'Тюмень', date: dateAfter(6_120), points_count: 1 },
    },
    cargo: {
      name: 'Комплектующие для оборудования',
      weight: 9.5,
      volume: 38,
      body_type: 'тентованный',
      truck_count: 1,
    },
    trading: {
      status: 'Auction',
      status_mobile: 'NotParticipating',
      start_time: dateAfter(-15),
      stop_time: dateAfter(180),
      bid_measurement_type: 'PerRoute',
      can_set_bet: true,
      is_bidder: false,
      is_available: true,
      price: { start: 43_000, current: 43_000, current_no_vat: 35_833 },
      your: { bet: false, last_bet: null },
    },
    payment: { form: 'Безналичная с НДС', currency_code: '643' },
  },
  {
    main: {
      id: 1014,
      cargo_num: 'CB-000001014',
      auc_type: 'Down',
      order_uid: '550e8400-e29b-41d4-a716-446655440006',
      created_at: dateAfter(-1_440),
      price_per_km: 70_000 / 760,
    },
    organizer: { organization_name: 'Восточный Контур' },
    route: {
      load: { city: 'Хабаровск', date: dateAfter(7_200), points_count: 1 },
      unload: { city: 'Владивосток', date: dateAfter(7_800), points_count: 1 },
    },
    cargo: {
      name: 'Контейнерный груз',
      weight: 24,
      volume: 76,
      body_type: 'контейнеровоз',
      truck_count: 1,
      containered: true,
    },
    trading: {
      status: 'Canceled',
      status_mobile: 'Unknown',
      start_time: dateAfter(-900),
      stop_time: dateAfter(-720),
      bid_measurement_type: 'PerRoute',
      can_set_bet: false,
      is_bidder: false,
      is_available: false,
      price: { start: 88_000, current: 84_000, current_no_vat: 70_000 },
      your: null,
    },
    payment: { form: 'Безналичная с НДС', currency_code: '643' },
  },
  {
    main: {
      id: 1008,
      cargo_num: 'CB-000001008',
      auc_type: 'Up',
      order_uid: '550e8400-e29b-41d4-a716-446655440007',
      created_at: dateAfter(-120),
      price_per_km: 34_167 / 450,
    },
    organizer: { organization_name: 'Речной Терминал' },
    route: {
      load: { city: 'Самара', date: dateAfter(2_160), points_count: 1 },
      unload: { city: 'Саратов', date: dateAfter(2_520), points_count: 1 },
    },
    cargo: {
      name: 'Упакованные напитки',
      weight: 14,
      volume: 48,
      body_type: 'изотермический',
      truck_count: 1,
    },
    trading: {
      status: 'Auction',
      status_mobile: 'Confirmed',
      start_time: dateAfter(-20),
      stop_time: dateAfter(95),
      bid_measurement_type: 'PerRoute',
      can_set_bet: true,
      is_bidder: true,
      is_available: true,
      price: { start: 39_000, current: 41_000, current_no_vat: 34_167 },
      your: null,
    },
    payment: { form: 'Безналичная с НДС', currency_code: '643' },
  },
  {
    main: {
      id: 1003,
      cargo_num: 'CB-000001003',
      auc_type: 'Down',
      order_uid: '550e8400-e29b-41d4-a716-446655440008',
      created_at: dateAfter(-75),
      price_per_km: null,
    },
    organizer: {},
    route: {
      load: { city: 'Ростов-на-Дону', date: dateAfter(3_600), points_count: 1 },
      unload: { city: 'Краснодар', date: dateAfter(3_960), points_count: 1 },
    },
    cargo: {
      name: 'Сельскохозяйственная продукция с длинным наименованием партии',
      weight: 21,
      volume: 67,
      body_type: 'рефрижератор',
      truck_count: 2,
      car: null,
    },
    trading: {
      status: 'Auction',
      status_mobile: 'Leading',
      start_time: dateAfter(-10),
      stop_time: dateAfter(210),
      bid_measurement_type: 'PerRoute',
      can_set_bet: true,
      is_bidder: true,
      is_available: true,
      price: { start: 76_000, current: 71_500, current_no_vat: 59_583 },
      your: { bet: true, last_bet: 71_500 },
    },
    payment: { form: 'Безналичная с НДС', currency_code: '643' },
  },
] satisfies AuctionListItem[];

function createRoutePoint(
  item: AuctionListItem,
  operation: 'Loading' | 'Unloading',
  rowNumber: number,
): RoutePoint {
  const route = operation === 'Loading' ? item.route?.load : item.route?.unload;

  return {
    row_num: rowNumber,
    op_type: operation,
    start_date: route?.date,
    location: {
      city_name: route?.city,
      city_full_name: route?.city ? `${route.city}, Россия` : undefined,
    },
    cargo: {
      name: item.cargo?.name,
      weight:
        item.cargo?.weight === undefined
          ? undefined
          : item.cargo.weight.toFixed(3),
      volume:
        item.cargo?.volume === undefined
          ? undefined
          : item.cargo.volume.toFixed(3),
    },
  };
}

function createAuctionDetail(
  item: AuctionListItem,
  index: number,
): AuctionResponse {
  const trading = item.trading;
  const detailSettings = getDetailSettings(item.main?.order_uid);

  return {
    main: {
      id: item.main?.id,
      cargo_num: item.main?.cargo_num,
      order_uid: item.main?.order_uid,
      auc_type: item.main?.auc_type,
      created_at: item.main?.created_at,
    },
    organizer: {
      organization_name: item.organizer?.organization_name,
      organization_inn:
        item.organizer?.organization_name === undefined
          ? undefined
          : organizerInns[index],
    },
    contacts: [],
    cargo: {
      distance: detailSettings.distance,
      truck_count: item.cargo?.truck_count,
      body_type: item.cargo?.body_type,
      temp_from: item.cargo?.temp_from,
      temp_to: item.cargo?.temp_to,
      containered: item.cargo?.containered ?? false,
      car: item.cargo?.car
        ? {
            type: item.cargo.car.type,
            weight: item.cargo.car.weight,
            volume: item.cargo.car.volume,
            width: item.cargo.car.width,
            length: item.cargo.car.length,
            height: item.cargo.car.height,
          }
        : null,
    },
    trading: {
      status: trading?.status,
      status_mobile: trading?.status_mobile,
      start_time: trading?.start_time,
      stop_time: trading?.stop_time,
      bid_measurement_type: trading?.bid_measurement_type ?? undefined,
      can_set_bet: trading?.can_set_bet,
      is_bidder: trading?.is_bidder,
      price: trading?.price
        ? {
            start: trading.price.start,
            current: trading.price.current,
            current_no_vat: trading.price.current_no_vat,
            max: detailSettings.max,
            min: detailSettings.min,
            step: detailSettings.step,
            price_per_km: item.main?.price_per_km ?? undefined,
          }
        : undefined,
      your: trading?.your
        ? {
            bet: trading.your.bet,
            last_bet: trading.your.last_bet,
            win: trading.status_mobile === 'Winner',
          }
        : undefined,
      settings: {},
    },
    payment: {
      form: item.payment?.form,
      currency_code: item.payment?.currency_code,
    },
    assembly: {},
    routes: [
      createRoutePoint(item, 'Loading', 1),
      createRoutePoint(item, 'Unloading', 2),
    ],
    admitted_organizations: [],
  };
}

const multipleRoutePoints = [
  {
    row_num: 3,
    op_type: 'Unloading',
    start_date: dateAfter(3_960),
    location: {
      city_name: 'Санкт-Петербург',
      city_full_name: 'Санкт-Петербург, Россия',
      loading_address: 'Складская улица, 18',
    },
    cargo: { name: 'Бытовая техника', weight: '8.000', volume: '40.000' },
  },
  {
    row_num: 1,
    op_type: 'Loading',
    start_date: dateAfter(2_880),
    location: {
      city_name: 'Казань',
      city_full_name: 'Казань, Россия',
      loading_address: 'Промышленная улица, 4',
    },
    cargo: { name: 'Бытовая техника', weight: '12.000', volume: '60.000' },
  },
  {
    row_num: 2,
    op_type: 'Unloading',
    start_date: dateAfter(3_540),
    location: {
      city_name: 'Тверь',
      city_full_name: 'Тверь, Россия',
      loading_address: 'Московское шоссе, 11',
    },
    cargo: { name: 'Бытовая техника', weight: '4.000', volume: '20.000' },
  },
] satisfies RoutePoint[];

export const auctionDetailItems = auctionListItems.map((item, index) => {
  const detail = createAuctionDetail(item, index);

  if (item.main?.order_uid === '550e8400-e29b-41d4-a716-446655440006') {
    return { ...detail, hide_bets_history: true };
  }

  return item.main?.order_uid === '550e8400-e29b-41d4-a716-446655440002'
    ? {
        ...detail,
        routes: multipleRoutePoints,
      }
    : detail;
});

interface AuctionBidHistoryFixture {
  auctionUuid: string;
  bets: AuctionBet[];
}

export const auctionBidHistoryItems = [
  {
    auctionUuid: '550e8400-e29b-41d4-a716-446655440001',
    bets: [
      {
        id: 103,
        auction_id: 1059,
        subscriber_id: 41,
        organization_name: 'Северный Экспресс',
        created_at: dateAfter(-10),
        price_with_vat: 28_500,
        price_no_vat: 23_750,
      },
      {
        id: 102,
        auction_id: 1059,
        subscriber_id: 41,
        organization_name: 'Северный Экспресс',
        created_at: dateAfter(-25),
        price_with_vat: 30_000,
        price_no_vat: 25_000,
      },
      {
        id: 101,
        auction_id: 1059,
        subscriber_id: 37,
        organization_name: 'ТрансЛиния',
        created_at: dateAfter(-40),
        price_with_vat: 32_000,
        price_no_vat: 26_666.67,
      },
      {
        id: 100,
        auction_id: 1059,
        subscriber_id: 35,
        organization_name: 'Отменённый участник',
        created_at: dateAfter(-42),
        price_with_vat: 33_000,
        is_rejected: true,
        cancel_reason: 'Ставка отозвана',
      },
    ],
  },
  {
    auctionUuid: '550e8400-e29b-41d4-a716-446655440002',
    bets: [
      {
        id: 203,
        auction_id: 1048,
        subscriber_id: 52,
        organization_name: 'Балтийский Транзит',
        created_at: dateAfter(-5),
        price_with_vat: 61_000,
        price_no_vat: 50_833.33,
        is_counter: true,
      },
      {
        id: 202,
        auction_id: 1048,
        subscriber_id: 999,
        organization_name: 'Демо-перевозчик',
        created_at: dateAfter(-15),
        price_with_vat: 60_000,
        price_no_vat: 50_000,
      },
    ],
  },
  {
    auctionUuid: '550e8400-e29b-41d4-a716-446655440003',
    bets: [],
  },
  {
    auctionUuid: '550e8400-e29b-41d4-a716-446655440004',
    bets: [
      {
        id: 403,
        auction_id: 1027,
        subscriber_id: 63,
        organization_name: 'СеверАвто',
        created_at: dateAfter(-1_690),
        price_with_vat: 47_500,
        price_no_vat: 39_583.33,
        is_win: true,
        place: 1,
      },
      {
        id: 402,
        auction_id: 1027,
        subscriber_id: 68,
        organization_name: 'РегионТранс',
        created_at: dateAfter(-1_740),
        price_with_vat: 50_000,
        price_no_vat: 41_666.67,
      },
      {
        id: 401,
        auction_id: 1027,
        subscriber_id: 63,
        organization_name: 'СеверАвто',
        created_at: dateAfter(-1_790),
        price_with_vat: 52_000,
        price_no_vat: 43_333.33,
      },
    ],
  },
  {
    auctionUuid: '550e8400-e29b-41d4-a716-446655440005',
    bets: [],
  },
  {
    auctionUuid: '550e8400-e29b-41d4-a716-446655440006',
    bets: [],
  },
  {
    auctionUuid: '550e8400-e29b-41d4-a716-446655440007',
    bets: [
      {
        id: 702,
        auction_id: 1008,
        subscriber_id: 82,
        organization_name: 'Поволжье Транс',
        created_at: dateAfter(-2),
        price_with_vat: 41_000,
        price_no_vat: 34_166.67,
      },
      {
        id: 701,
        auction_id: 1008,
        subscriber_id: 79,
        organization_name: 'Самара Карго',
        created_at: dateAfter(-3),
        price_with_vat: 40_000,
        price_no_vat: 33_333.33,
      },
    ],
  },
  {
    auctionUuid: '550e8400-e29b-41d4-a716-446655440008',
    bets: [
      {
        id: 801,
        auction_id: 1003,
        created_at: dateAfter(-5),
        price_info: {
          price_with_vat: 71_500,
          price_no_vat: 59_583.33,
          payment_type: null,
          vat_rate: null,
        },
        organization_name: '',
        transporter_comment: null,
        place: null,
      },
    ],
  },
] satisfies AuctionBidHistoryFixture[];

function replaceItems<T>(target: T[], source: T[]) {
  target.splice(0, target.length, ...structuredClone(source));
}

export const auctionMockState: {
  bidHistories: AuctionBidHistoryFixture[];
  details: AuctionResponse[];
  listItems: AuctionListItem[];
} = {
  bidHistories: structuredClone(auctionBidHistoryItems),
  details: structuredClone(auctionDetailItems),
  listItems: structuredClone(auctionListItems),
};

export function resetAuctionMockState() {
  replaceItems(auctionMockState.listItems, auctionListItems);
  replaceItems(auctionMockState.details, auctionDetailItems);
  replaceItems(auctionMockState.bidHistories, auctionBidHistoryItems);
}

export const auctionListStore = {
  items: auctionMockState.listItems,
};

export const auctionDetailStore = {
  items: auctionMockState.details,
};

export const auctionBidHistoryStore = {
  items: auctionMockState.bidHistories,
};
