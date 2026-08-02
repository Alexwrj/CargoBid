import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  auctionFilterFormSchema,
  filterFormValuesToSearch,
  searchToFilterFormValues,
  type AuctionFilterFormValues,
  type AuctionFilterSearch,
} from '@/features/auction-filters/model/auction-filter-search';
import { temporaryCities } from '@/features/auction-filters/model/temporary-cities';
import { Button } from '@/shared/ui/button/Button';
import {
  ComboboxField,
  type ComboboxOption,
} from '@/shared/ui/combobox-field/ComboboxField';
import { NumberField } from '@/shared/ui/number-field/NumberField';
import { SelectField } from '@/shared/ui/select-field/SelectField';
import { TextField } from '@/shared/ui/text-field/TextField';

import styles from './AuctionFiltersForm.module.scss';

const auctionStatusOptions = [
  { label: 'Планирование', value: 'Planning' },
  { label: 'Торги идут', value: 'Auction' },
  { label: 'Определение победителя', value: 'DeterminateWinner' },
  { label: 'Ожидание сделки', value: 'WaitDeal' },
  { label: 'В работе', value: 'InProgress' },
  { label: 'Завершён', value: 'Finished' },
  { label: 'Остановлен', value: 'Stopped' },
  { label: 'Отменён', value: 'Canceled' },
] as const;

const auctionTypeOptions = [
  { label: 'Заявочный', value: 'Request' },
  { label: 'На повышение', value: 'Up' },
  { label: 'На понижение', value: 'Down' },
  { label: 'Фиксированная цена', value: 'FixPrice' },
] as const;

const userStatusOptions = [
  { label: 'Не участвую', value: 'NotParticipating' },
  { label: 'Лидирую', value: 'Leading' },
  { label: 'Ставка перебита', value: 'Losing' },
  { label: 'Участие подтверждено', value: 'Confirmed' },
  { label: 'Победил', value: 'Winner' },
] as const;

const bodyTypeOptions = [
  { label: 'Тентованный', value: 'тентованный' },
  { label: 'Фургон', value: 'фургон' },
  { label: 'Рефрижератор', value: 'рефрижератор' },
  { label: 'Бортовой', value: 'бортовой' },
  { label: 'Контейнеровоз', value: 'контейнеровоз' },
  { label: 'Изотермический', value: 'изотермический' },
] as const;

const availabilityOptions = [
  { label: 'Только доступные', value: 'true' },
  { label: 'Только недоступные', value: 'false' },
] as const;

const temporaryCityOptions: ComboboxOption[] = temporaryCities.map((city) => ({
  label: city,
  value: city,
}));

function findCityOption(value: string): ComboboxOption | null {
  const normalizedValue = value.trim().toLocaleLowerCase('ru-RU');

  return (
    temporaryCityOptions.find(
      (option) => option.value.toLocaleLowerCase('ru-RU') === normalizedValue,
    ) ?? null
  );
}

interface AuctionFiltersFormProps {
  appliedFilters: AuctionFilterSearch;
  onApply: (filters: AuctionFilterSearch) => void;
  onReset: () => void;
}

export function AuctionFiltersForm({
  appliedFilters,
  onApply,
  onReset,
}: AuctionFiltersFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<AuctionFilterFormValues>({
    defaultValues: searchToFilterFormValues(appliedFilters),
    resolver: zodResolver(auctionFilterFormSchema),
  });

  useEffect(() => {
    reset(searchToFilterFormValues(appliedFilters));
  }, [appliedFilters, reset]);

  const submit = handleSubmit((values) => {
    onApply(filterFormValuesToSearch(values));
  });

  return (
    <form className={styles.form} onSubmit={(event) => void submit(event)}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Фильтры</h2>
          <p className={styles.description}>
            Изменения применятся после нажатия кнопки.
          </p>
        </div>
        <div className={styles.actions}>
          <Button
            className={styles.resetButton}
            onClick={() => {
              reset(searchToFilterFormValues({}));
              onReset();
            }}
            variant="ghost"
          >
            Сбросить
          </Button>
          <Button type="submit">Применить</Button>
        </div>
      </header>

      <div className={styles.grid}>
        <Controller
          control={control}
          name="loadCity"
          render={({ field }) => (
            <ComboboxField
              description="Начните вводить или выберите город"
              inputValue={field.value}
              label="Город отправления"
              name={field.name}
              onInputValueChange={field.onChange}
              onValueChange={(option) => {
                if (option) field.onChange(option.value);
              }}
              options={temporaryCityOptions}
              value={findCityOption(field.value)}
            />
          )}
        />
        <Controller
          control={control}
          name="unloadCity"
          render={({ field }) => (
            <ComboboxField
              description="Начните вводить или выберите город"
              inputValue={field.value}
              label="Город назначения"
              name={field.name}
              onInputValueChange={field.onChange}
              onValueChange={(option) => {
                if (option) field.onChange(option.value);
              }}
              options={temporaryCityOptions}
              value={findCityOption(field.value)}
            />
          )}
        />
        <TextField
          description="Можно ввести часть номера"
          label="Номер заявки"
          {...register('cargoNum')}
        />

        <Controller
          control={control}
          name="auctionStatus"
          render={({ field }) => (
            <SelectField
              label="Статус аукциона"
              name={field.name}
              onValueChange={(value) => field.onChange(value ?? '')}
              options={auctionStatusOptions}
              placeholder="Любой статус"
              value={field.value || null}
            />
          )}
        />
        <Controller
          control={control}
          name="auctionType"
          render={({ field }) => (
            <SelectField
              label="Тип аукциона"
              name={field.name}
              onValueChange={(value) => field.onChange(value ?? '')}
              options={auctionTypeOptions}
              placeholder="Любой тип"
              value={field.value || null}
            />
          )}
        />
        <Controller
          control={control}
          name="userStatus"
          render={({ field }) => (
            <SelectField
              label="Моё положение"
              name={field.name}
              onValueChange={(value) => field.onChange(value ?? '')}
              options={userStatusOptions}
              placeholder="Любое положение"
              value={field.value || null}
            />
          )}
        />
        <Controller
          control={control}
          name="bodyType"
          render={({ field }) => (
            <SelectField
              label="Тип кузова"
              name={field.name}
              onValueChange={(value) => field.onChange(value ?? '')}
              options={bodyTypeOptions}
              placeholder="Любой тип"
              value={field.value || null}
            />
          )}
        />

        <Controller
          control={control}
          name="weightFrom"
          render={({ field }) => (
            <NumberField
              error={errors.weightFrom?.message}
              label="Вес от, т"
              min={0}
              name={field.name}
              onValueChange={(value) => field.onChange(value)}
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="weightTo"
          render={({ field }) => (
            <NumberField
              error={errors.weightTo?.message}
              label="Вес до, т"
              min={0}
              name={field.name}
              onValueChange={(value) => field.onChange(value)}
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="isAvailable"
          render={({ field }) => (
            <SelectField
              label="Доступность участия"
              name={field.name}
              onValueChange={(value) => field.onChange(value ?? '')}
              options={availabilityOptions}
              placeholder="Любая"
              value={field.value || null}
            />
          )}
        />
      </div>
    </form>
  );
}
