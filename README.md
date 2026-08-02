# CargoBid

Frontend-приложение для работы с грузовыми аукционами. Реализованы технический
фундамент, типобезопасная контрактная граница Auction API, список с URL-фильтрами,
контрактная страница деталей аукциона, история ставок и установка ставки.

## Требования и запуск

- Node.js 24.12.0 или совместимая актуальная LTS-версия;
- npm 11+.

```bash
npm ci
cp .env.example .env.local
npm run api:generate
npm run dev
```

Основные команды:

```bash
npm run api:generate
npm run lint
npm run typecheck
npm run test:run
npm run format:check
npm run build
```

`npm test` запускает Vitest в watch-режиме, `npm run preview` — локальный
просмотр production build, а `npm run format` форматирует рукописные файлы.

## OpenAPI и генерация типов

Единственный источник API-контракта — корневой файл
`openapi.auctions.v1.json`. В тексте задания этапа 2 встречается устаревшее имя
`openapi.auctions.v0.json`; команда и код намеренно используют фактическую
версию `v1`.

Для генерации выбран `openapi-typescript`: он создаёт только TypeScript-типы и
не добавляет runtime-клиент. По аналогии с изоляцией API-генератора в основном
проекте код генерации вынесен из package script в `scripts/api-generator` и не
смешивается с runtime API-слоем. Генерация полностью локальна:

```bash
npm run api:generate
```

Результат находится в `src/shared/api/generated`. Как и в референсном проекте,
общий машинный контракт хранится в `types.ts`, а каждая OpenAPI operation
получает отдельный generated-файл в директории, соответствующей URL:

```text
generated/
  types.ts
  auctions/
    getAuction.ts
    list/
      listAuctions.ts
    bets/
      listBets.ts
      setBet.ts
```

Операционные файлы генерируются из `operationId`, HTTP method, path/query
parameters, request body и успешного response. Они используют общий
рукописный fetch-клиент, но не дублируются вручную в entity-слое. Generated
файлы содержат предупреждение о генерации и не редактируются вручную. Директория
исключена из Prettier и ESLint, но остаётся включённой в TypeScript typecheck.

`openapi-typescript@7` поддерживает TypeScript 5.x, поэтому проект использует
совместимую версию TypeScript 5.9 вместо обхода peer-зависимости через
`--force`/`legacy-peer-deps`.

## API-слой

```text
src/
  shared/api/
    generated/types.ts         generated DTO и operations
    generated/auctions/        generated endpoint-функции
    client.ts                  настроенный экземпляр HTTP-клиента
    config.ts                  граница VITE_API_BASE_URL
    http-client.ts             общий fetch-клиент
    api-error.ts               типы транспортных ошибок

  entities/auction/
    api/                       query keys и query options списка/деталей/ставок
    model/                     адаптация DTO для экранов и ошибок
    ui/                        продуктовая карточка аукциона

  mocks/
    data/                       минимальные contract fixtures
    handlers/                  stateless MSW handlers
```

Generated-операции возвращают контрактные DTO без маскировки под domain models:

| Функция        | Контрактный endpoint                |
| -------------- | ----------------------------------- |
| `listAuctions` | `POST /auctions/list`               |
| `getAuction`   | `GET /auctions/{auctionUuid}`       |
| `listBets`     | `GET /auctions/{auctionUuid}/bets`  |
| `setBet`       | `POST /auctions/{auctionUuid}/bets` |

Все функции принимают единый объект generated-параметров и поддерживают
`AbortSignal`. `auctionUuid` кодируется перед подстановкой в URL. `listBets`
поддерживает контрактный query-параметр `all`. Успешный `setBet` возвращает
`void`, потому что OpenAPI не документирует тело ответа.

Список использует `auctionListQueryOptions`: generated-функция `listAuctions`
вызывается вне React-компонента, а параметры запроса структурно входят в
централизованный `auctionKeys.list`. Детали и история используют независимые
query options; ключ истории содержит `auctionUuid`, поэтому данные разных
аукционов не смешиваются. Установка ставки вызывает generated `setBet` через
TanStack Query mutation и после подтверждения сервера обновляет детали, историю
и список инвалидированием соответствующих query keys. Вызов endpoint и политика
синхронизации cache принадлежат feature API-hook; компонент формы отвечает
только за редактирование, отправку и отображение состояния операции.

## Runtime-конфигурация

API base URL читается только через `src/shared/api/config.ts`:

```dotenv
VITE_API_BASE_URL=/api/v1
```

- development по умолчанию использует относительный `/api/v1`, удобный для
  browser MSW;
- tests используют `http://localhost/api/v1`, поскольку Node fetch требует
  абсолютный URL;
- production требует явный `VITE_API_BASE_URL` и выбрасывает понятную ошибку при
  его отсутствии;
- `.env` и локальные варианты игнорируются Git, коммитится только
  `.env.example`.

Секреты и Bearer token в эту переменную не входят.

## HTTP-ошибки

Централизованный клиент работает поверх стандартного `fetch` и различает:

- `HttpError` — non-2xx со статусом и сохранённым response body, включая 422;
- `NetworkError` — ошибка соединения или чтения response stream;
- `RequestAbortedError` — отмена до или во время запроса;
- `ResponseParseError` — успешный endpoint обещал JSON, но вернул пустое или
  невалидное тело.

Клиент не создаёт пользовательские тексты, toast и не скрывает исходную причину.
Для endpoint без документированного body используется явный response type
`void`.

## Аудит OpenAPI

Схема описывает 48 component schemas и четыре operationId:
`listAuctions`, `getAuction`, `listBets`, `setBet`. Основные DTO:
`AuctionListRequest`, `AuctionListResponseBase`, `AuctionShowResponse`,
`BetListResponse`, `SetBetRequest`, `ProblemDetail` и `ValidationProblem`.

Документированные ответы:

- `401`, `404` и `503` используют `ProblemDetail` там, где применимы;
- `422` для списка и установки ставки использует `ValidationProblem` с
  обязательным массивом `errors`;
- `POST bets` имеет успешный `200` без response body.

Даты представлены строками `date-time`, идентификатор пути — строкой с форматом
UUID, цены и размеры — числами с форматами `float`/`double`. Основные enum:
`AuctionStatus`, `AuctionType`, `TradingStatus`, `BidMeasurementType`,
`OperationType` и `PaymentDelayType`.

Замеченные неоднозначности и принятые допущения:

- большинство вложенных schemas не содержит `required`, поэтому generated
  свойства остаются optional; клиент не усиливает контракт вручную;
- request body `POST /auctions/list` формально optional; функция принимает
  пустой DTO по умолчанию и отправляет `{}`;
- nullable `all` не передаётся в query при `null`/`undefined`, а boolean
  сериализуется как `true`/`false`;
- Bearer security объявлена глобально, но контракт не определяет источник или
  жизненный цикл токена; Authorization пока не добавляется;
- дублирующиеся `hide_bets_history` и правила min/max/step остаются такими, как
  зафиксировано в `x-candidate-decisions`;
- пересчёт торгового состояния и гарантии optional response fields не
  определены;
- успешное тело `setBet` не документировано, поэтому клиент сознательно его
  игнорирует.

Generated TypeScript обеспечивает compile-time соответствие. Runtime-validation
ответов пока не добавляется: MSW/backend считаются реализациями OpenAPI.
Критические runtime-схемы можно добавить позднее, не создавая вручную Zod-копии
всех DTO.

## MSW

Browser worker запускается до React render только в development. В тестах Node
server считает необработанные запросы ошибками и сбрасывает overrides после
каждого теста.

Временный health handler удалён. Вместо него существуют handlers реальных
Auction API endpoints. Восемь синтетических fixtures типизированы generated DTO
и покрывают разные контрактные статусы, nullable-поля, маршруты, грузы и цены.
Handler списка применяет реализованные поля `AuctionListRequest` до пагинации и
в тестах может возвращать success, empty или 503. Handler деталей находит
аукцион по `auctionUuid`, возвращает контрактный `AuctionShowResponse` или
документированный `404 ProblemDetail`. Handler истории возвращает ставки только
выбранного аукциона, по умолчанию исключает отклонённые записи и поддерживает
контрактный `all=true`. Handler установки ставки моделирует успешную отправку,
контрактные ошибки и устаревшие данные. Изменяемое состояние существует только
в MSW и полностью сбрасывается между тестами; это локальная демонстрационная
модель, а не клиентский аукционный движок.

List, detail и history fixtures используют общие идентификаторы и согласованные
сценарии: расстояние задаётся явно для маршрута, `price_per_km` соответствует
контрактной формуле, а ставки укладываются во временной интервал и направление
торгов.

## Маршруты и стили

| URL                          | Назначение                               |
| ---------------------------- | ---------------------------------------- |
| `/`                          | Перенаправление на `/auctions`           |
| `/auctions`                  | Адаптивный список аукционов              |
| `/auctions/:auctionUuid`     | Контрактные детали аукциона              |
| `/auctions/:auctionUuid/bet` | Placeholder установки ставки             |
| `/ui-kit`                    | Каталог UI-компонентов, только dev-режим |
| любой неизвестный URL        | Страница 404                             |

Страницы загружаются лениво. Компонентные стили используют colocated SCSS
Modules: selectors записываются в kebab-case, а TSX получает camelCase exports.
Глобальный SCSS содержит только reset и базовые element rules; дизайн-токены
подключаются отдельным глобальным файлом `src/shared/ui/tokens/tokens.scss`.

Маршрутизация построена на TanStack Router. Для приложения и каждого теста
создаётся отдельный router; тестовая фабрика использует memory history. Карточка
аукциона — одна доступная ссылка на `/auctions/$auctionUuid` без вложенных
интерактивных элементов.

## Вертикальный срез списка

Поток данных списка:

```text
MSW fixture → generated listAuctions → TanStack Query → presenter → AuctionListCard
```

Route-level страница хранит только номер текущей страницы пагинации. Серверный
ответ остаётся в TanStack Query и не копируется в локальный или глобальный
store. Presenter формирует безопасные подписи optional-полей, форматирует даты,
валюту и единицы измерения и напрямую сопоставляет контрактные статусы с
визуальным представлением, не вычисляя бизнес-состояние торгов.

Страница содержит карточечный skeleton, empty и error states, повтор запроса
через Query и минимальную контрактную пагинацию. Desktop-карточка разделяет
данные перевозки и коммерческий блок; на tablet/mobile блоки перестраиваются в
одну колонку.

## Контрактные фильтры и URL-state

Применённые фильтры списка хранятся в search-параметрах TanStack Router и
валидируются Zod 4. Черновые значения принадлежат React Hook Form и не меняют
URL или запрос до нажатия «Применить».

```text
RHF draft → Apply → URL search → OpenAPI request → query key → MSW/backend
```

Публичный URL использует понятные UI-названия, а чистый mapper переводит их в
поля `AuctionListRequest`. Например:

```text
/auctions?auctionStatus=Auction&userStatus=Leading&loadCity=Пермь&page=2
```

На текущем этапе поддержаны:

- `auctionStatus` → контрактный числовой `statuses`;
- `userStatus` → контрактный `status`;
- `loadCity`, `unloadCity`;
- `cargoNum`, `bodyType`;
- `weightFrom`, `weightTo`;
- `isAvailable`;
- `page`.

Пустые и некорректные значения безопасно отбрасываются. Apply и Reset сбрасывают
пагинацию, Back/Forward и reload восстанавливают форму из URL. MSW применяет те
же контрактные поля до пагинации; между фильтрами действует AND. Города и номер
заявки сопоставляются регистронезависимо по вхождению подстроки. Для городов по
решению кандидата подключён временный локальный справочник: combobox предлагает
варианты, но не запрещает ручной ввод. После появления контрактного источника
локальный список должен быть заменён API-интеграцией.

## Детальная страница аукциона

Экран `/auctions/:auctionUuid` получает идентификатор из TanStack Router и
запрашивает `GET /auctions/{auctionUuid}` через generated-функцию и отдельный
Query key. Presenter адаптирует optional-поля `AuctionShowResponse`, упорядочивает
точки маршрута по `row_num` и переиспользует общие форматтеры и словари статусов
списка. Page-компонент работает только с подготовленной ViewModel, включая
доступность и ограничения установки ставки, и не обращается к raw DTO.

Страница показывает маршрут, груз и требования к транспорту, организатора,
условия оплаты, сводку торгов и независимую историю ставок. Если контрактные
`trading.can_set_bet` и `trading.status` разрешают участие, в торговом блоке
отображается форма установки ставки.

Черновик суммы принадлежит React Hook Form, проверяется Zod-схемой и не меняет
серверные данные до успешного `POST /auctions/{auctionUuid}/bets`. Форма
проверяет число, положительность и прямые `min_price`/`max_price`, но намеренно
не вычисляет следующую цену и не проверяет кратность `step`: база шага и правила
направления торгов в контракте не определены. При успехе поле очищается после
обновления запросов. При `422` введённая сумма сохраняется, а детали и история
перезапрашиваются; системная ошибка допускает повторную отправку без потери
значения. Повторный submit блокируется на время mutation.

Loading, `404` и остальные системные ошибки имеют самостоятельные состояния;
для повторяемой ошибки доступен retry. Detail URL не наследует search-параметры
списка. Возврат через browser history восстанавливает предыдущий
отфильтрованный URL, а для прямого открытия используется fallback на чистый
`/auctions`.

## Дизайн-токены и UI kit

Локальный UI kit построен без CSS-фреймворка. Интерактивные headless-примитивы
используют `@base-ui/react`, а внешний вид полностью принадлежит colocated SCSS
Modules. Manrope Variable используется для интерфейсного текста, JetBrains Mono
Variable — для цен, таймеров и других метрик; оба шрифта поставляются локально
через `@fontsource-variable`.

Токены разделены по назначению:

- primitive palette хранит исходные цвета;
- semantic tokens описывают роли текста, поверхностей, границ, действий и
  состояний;
- component geometry задаёт высоты контролов, радиусы, тени и размеры layout.

Компоненты используют semantic/component tokens и не зависят напрямую от
hex-значений. Цвет декоративного акцента отделён от более тёмного цвета primary
action, чтобы сохранить характер макета и читаемый контраст интерактивного
текста.

В `src/shared/ui` доступны:

- `Button`, `IconButton`, `Badge`, `FilterChip`;
- `TextField`, `SearchField`, `TextArea`, `NumberField`;
- `SelectField`, `ComboboxField`, `Switch`, `Tabs`;
- `ResponsiveDialog`, `Tooltip`, `Pagination`;
- `Skeleton`, `EmptyState`, `ErrorState`.

`ResponsiveDialog` отображается как модальное окно на широком экране и занимает
весь viewport на мобильном. Каталог `/ui-kit` лениво подключается только при
`import.meta.env.DEV` и не попадает в production router. Product-компоненты
аукциона не добавляются в `shared/ui`: карточка списка находится у сущности в
`entities/auction/ui`.

## Текущие границы

Реализованы список, URL-фильтры, страница деталей, независимая история и
установка ставки. Намеренно отсутствуют расширенные и мультизначные фильтры,
polling/WebSocket, runtime-validation всех response DTO, production-аукционный
движок и не подтверждённые контрактом правила торгов. Mutation не использует
optimistic update: источником подтверждённого состояния остаётся серверный
ответ на последующие запросы.
Оставшееся время форматируется на момент получения данных без
синхронизированного realtime-таймера.

История применения AI и инженерного контроля кандидата зафиксирована в
[AI_USAGE.md](./AI_USAGE.md).
