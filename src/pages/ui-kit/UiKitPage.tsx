import { useState, type ReactNode } from 'react';

import { Badge } from '@/shared/ui/badge/Badge';
import { Button } from '@/shared/ui/button/Button';
import {
  ComboboxField,
  type ComboboxOption,
} from '@/shared/ui/combobox-field/ComboboxField';
import { FilterChip } from '@/shared/ui/filter-chip/FilterChip';
import { IconButton } from '@/shared/ui/icon-button/IconButton';
import { NumberField } from '@/shared/ui/number-field/NumberField';
import { Pagination } from '@/shared/ui/pagination/Pagination';
import { ResponsiveDialog } from '@/shared/ui/responsive-dialog/ResponsiveDialog';
import { SearchField } from '@/shared/ui/search-field/SearchField';
import { SelectField } from '@/shared/ui/select-field/SelectField';
import { Skeleton } from '@/shared/ui/skeleton/Skeleton';
import { EmptyState, ErrorState } from '@/shared/ui/state-message/StateMessage';
import { Switch } from '@/shared/ui/switch/Switch';
import { Tabs } from '@/shared/ui/tabs/Tabs';
import { TextArea } from '@/shared/ui/text-area/TextArea';
import { TextField } from '@/shared/ui/text-field/TextField';
import { Tooltip } from '@/shared/ui/tooltip/Tooltip';

import styles from './UiKitPage.module.scss';

const cityOptions = [
  { label: 'Москва', value: 'moscow' },
  { label: 'Санкт-Петербург', value: 'saint-petersburg' },
  { label: 'Казань', value: 'kazan' },
  { disabled: true, label: 'Владивосток (недоступно)', value: 'vladivostok' },
] satisfies readonly ComboboxOption[];

interface ShowcaseSectionProps {
  children: ReactNode;
  description?: string;
  title: string;
}

function ShowcaseSection({
  children,
  description,
  title,
}: ShowcaseSectionProps) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {description ? (
          <p className={styles.sectionDescription}>{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function UiKitPage() {
  const [city, setCity] = useState('moscow');
  const [searchCity, setSearchCity] = useState<ComboboxOption | null>(
    cityOptions[1] ?? null,
  );
  const [isOnlyActive, setIsOnlyActive] = useState(true);
  const [page, setPage] = useState(2);

  return (
    <div className={styles.catalogue}>
      <header className={styles.hero}>
        <Badge tone="accent">Development only</Badge>
        <h1 className={styles.title}>CargoBid UI kit</h1>
        <p className={styles.lead}>
          Локальный каталог токенов и примитивов. Компоненты намеренно не
          содержат продуктовую логику аукционов.
        </p>
      </header>

      <ShowcaseSection
        description="Семантические роли поверх палитры: компоненты не зависят от конкретных hex-значений."
        title="Цветовые токены"
      >
        <div className={styles.swatchGrid}>
          <article className={styles.swatch}>
            <span className={styles.swatchInk} />
            <strong>Text primary</strong>
            <code>--color-text-primary</code>
          </article>
          <article className={styles.swatch}>
            <span className={styles.swatchAccent} />
            <strong>Accent</strong>
            <code>--color-accent</code>
          </article>
          <article className={styles.swatch}>
            <span className={styles.swatchAction} />
            <strong>Primary action</strong>
            <code>--color-action-primary</code>
          </article>
          <article className={styles.swatch}>
            <span className={styles.swatchSuccess} />
            <strong>Success</strong>
            <code>--color-success</code>
          </article>
          <article className={styles.swatch}>
            <span className={styles.swatchDanger} />
            <strong>Danger</strong>
            <code>--color-danger</code>
          </article>
          <article className={styles.swatch}>
            <span className={styles.swatchSurface} />
            <strong>Surface</strong>
            <code>--color-surface-subtle</code>
          </article>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Типографика">
        <div className={styles.typeScale}>
          <p className={styles.displaySample}>2 450 000 ₽</p>
          <p className={styles.titleSample}>Активные аукционы</p>
          <p className={styles.bodySample}>
            Интерфейсный текст набран Manrope, числовые метрики — JetBrains
            Mono.
          </p>
          <p className={styles.metricSample}>01:24:36</p>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Кнопки и статусы">
        <div className={styles.row}>
          <Button>Сделать ставку</Button>
          <Button variant="secondary">Подробнее</Button>
          <Button variant="ghost">Сбросить</Button>
          <Button variant="danger">Отменить</Button>
          <Button isLoading>Отправка</Button>
          <Button disabled>Недоступно</Button>
          <Tooltip trigger={<IconButton aria-label="Справка">?</IconButton>}>
            Подсказка открывается с клавиатуры и по наведению
          </Tooltip>
        </div>
        <div className={styles.row}>
          <Badge showDot tone="success">
            Активен
          </Badge>
          <Badge tone="warning">Завершается</Badge>
          <Badge tone="danger">Ошибка</Badge>
          <Badge appearance="solid" tone="info">
            Новый
          </Badge>
          <FilterChip count={12} isSelected>
            Москва
          </FilterChip>
          <FilterChip count={4}>Казань</FilterChip>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Поля и выбор">
        <div className={styles.formGrid}>
          <TextField
            description="Как в договоре"
            label="Название компании"
            placeholder="ООО Карго"
          />
          <SearchField label="Поиск" placeholder="Номер или маршрут" />
          <TextField
            defaultValue="Некорректное значение"
            error="Проверьте формат"
            label="Поле с ошибкой"
          />
          <NumberField
            defaultValue={125000}
            description="Шаг — 1 000 ₽"
            format={{ style: 'decimal' }}
            label="Ваша ставка"
            min={0}
            step={1000}
          />
          <SelectField
            label="Город отправления"
            onValueChange={(nextCity) => {
              if (nextCity) setCity(nextCity);
            }}
            options={cityOptions}
            value={city}
          />
          <ComboboxField
            description="Можно искать по названию"
            label="Город назначения"
            onValueChange={setSearchCity}
            options={cityOptions}
            value={searchCity}
          />
          <TextArea
            className={styles.formWide}
            label="Комментарий"
            placeholder="Условия перевозки"
          />
          <Switch
            checked={isOnlyActive}
            className={styles.formWide}
            description="Скрывает завершённые торги"
            label="Только активные аукционы"
            onCheckedChange={setIsOnlyActive}
          />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Навигация и оверлеи">
        <Tabs
          items={[
            {
              content: 'Основные условия и параметры перевозки.',
              label: 'Условия',
              value: 'terms',
            },
            {
              content: 'История ставок участников аукциона.',
              label: 'Ставки',
              value: 'bets',
            },
            {
              content: 'Раздел пока недоступен.',
              disabled: true,
              label: 'Документы',
              value: 'documents',
            },
          ]}
        />
        <div className={styles.navigationDemo}>
          <Pagination
            currentPage={page}
            onPageChange={setPage}
            siblingCount={2}
            totalPages={6}
          />
          <ResponsiveDialog
            description="На мобильном экране диалог занимает весь viewport."
            footer={
              <>
                <Button variant="secondary">Отмена</Button>
                <Button>Подтвердить</Button>
              </>
            }
            title="Подтверждение ставки"
            trigger={<Button variant="secondary">Открыть диалог</Button>}
          >
            <p className={styles.dialogCopy}>
              Проверьте сумму и условия перед отправкой. Это демонстрационный
              контент без продуктового поведения.
            </p>
          </ResponsiveDialog>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Состояния загрузки и данных">
        <div className={styles.skeletonCard}>
          <Skeleton height="1.25rem" width="40%" />
          <Skeleton />
          <Skeleton width="75%" />
        </div>
        <div className={styles.stateGrid}>
          <EmptyState
            action={<Button variant="secondary">Сбросить фильтры</Button>}
            description="Попробуйте изменить параметры поиска."
            icon="⌕"
            title="Аукционы не найдены"
          />
          <ErrorState
            action={<Button variant="secondary">Повторить</Button>}
            description="Не удалось получить данные."
            icon="!"
            title="Ошибка загрузки"
          />
        </div>
      </ShowcaseSection>
    </div>
  );
}
