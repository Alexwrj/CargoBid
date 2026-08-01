import type { components } from '@/shared/api/generated/types';

type AuctionListItem = components['schemas']['AuctionListItem'];
type AuctionListResponse = components['schemas']['AuctionListResponseBase'];
type AuctionResponse = components['schemas']['AuctionShowResponse'];
type AuctionBetsResponse = components['schemas']['BetListResponse'];

const fixtureReferenceTime = Date.now();

function dateAfter(minutes: number) {
  return new Date(fixtureReferenceTime + minutes * 60_000).toISOString();
}

export const auctionListItems = [
  {
    main: {
      id: 1059,
      cargo_num: 'CB-000001059',
      auc_type: 'Down',
      order_uid: '550e8400-e29b-41d4-a716-446655440001',
      created_at: dateAfter(-180),
      price_per_km: 35.6,
    },
    organizer: { organization_name: 'Северный Вектор' },
    route: {
      load: { city: 'Пермь', date: dateAfter(1_440), points_count: 1 },
      unload: { city: 'Москва', date: dateAfter(1_800), points_count: 1 },
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
      price_per_km: 40.1,
    },
    organizer: { organization_name: 'Логика Пути' },
    route: {
      load: { city: 'Казань', date: dateAfter(2_880), points_count: 1 },
      unload: {
        city: 'Санкт-Петербург',
        date: dateAfter(3_360),
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
      price_per_km: 31.5,
    },
    organizer: { organization_name: 'Меридиан Карго' },
    route: {
      load: { city: 'Новосибирск', date: dateAfter(4_320), points_count: 1 },
      unload: { city: 'Омск', date: dateAfter(4_680), points_count: 1 },
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
      price_per_km: 29.8,
    },
    organizer: { organization_name: 'Полярная Линия' },
    route: {
      load: { city: 'Архангельск', date: dateAfter(-1_440), points_count: 1 },
      unload: { city: 'Вологда', date: dateAfter(-960), points_count: 1 },
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
      start_time: dateAfter(-600),
      stop_time: dateAfter(-480),
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
      price_per_km: 37.2,
    },
    organizer: { organization_name: 'Транзит Лаб' },
    route: {
      load: { city: 'Екатеринбург', date: dateAfter(5_760), points_count: 2 },
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
      price_per_km: 42,
    },
    organizer: { organization_name: 'Восточный Контур' },
    route: {
      load: { city: 'Хабаровск', date: dateAfter(7_200), points_count: 1 },
      unload: { city: 'Владивосток', date: dateAfter(7_680), points_count: 1 },
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
      price_per_km: 33.3,
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
      your: { bet: true, last_bet: 41_000 },
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
      unload: { city: 'Краснодар', date: dateAfter(3_960), points_count: 3 },
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

export const auctionListStore = {
  items: auctionListItems,
};

export const auctionListFixture = {
  data: auctionListItems,
  meta: {
    current_page: 1,
    from: 1,
    last_page: 1,
    per_page: auctionListItems.length,
    to: auctionListItems.length,
    total: auctionListItems.length,
  },
} satisfies AuctionListResponse;

export const auctionFixture = {
  main: {
    cargo_num: 'TEST-001',
    order_uid: '550e8400-e29b-41d4-a716-446655440000',
  },
  organizer: {},
  contacts: [],
  cargo: {},
  trading: {},
  payment: {},
  assembly: {},
  routes: [],
  admitted_organizations: [],
} satisfies AuctionResponse;

export const auctionBetsFixture = {
  bets: [],
} satisfies AuctionBetsResponse;
