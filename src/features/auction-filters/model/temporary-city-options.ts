import type { ComboboxOption } from '@/shared/ui/combobox-field/ComboboxField';

// Временный справочник до появления контрактного источника городов.
export const temporaryCityOptions = [
  'Архангельск',
  'Владивосток',
  'Вологда',
  'Екатеринбург',
  'Казань',
  'Краснодар',
  'Москва',
  'Новосибирск',
  'Омск',
  'Пермь',
  'Ростов-на-Дону',
  'Самара',
  'Санкт-Петербург',
  'Саратов',
  'Тюмень',
  'Хабаровск',
].map((city): ComboboxOption => ({ label: city, value: city }));
