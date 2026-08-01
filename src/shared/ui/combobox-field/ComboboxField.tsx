import { Combobox } from '@base-ui/react/combobox';
import classNames from 'classnames';
import { useId } from 'react';

import styles from './ComboboxField.module.scss';

export interface ComboboxOption {
  disabled?: boolean;
  label: string;
  value: string;
}

export interface ComboboxFieldProps {
  className?: string;
  defaultValue?: ComboboxOption | null;
  description?: string;
  disabled?: boolean;
  error?: string;
  label: string;
  name?: string;
  onValueChange?: (value: ComboboxOption | null) => void;
  options: readonly ComboboxOption[];
  placeholder?: string;
  required?: boolean;
  value?: ComboboxOption | null;
}

export function ComboboxField({
  className,
  defaultValue,
  description,
  disabled,
  error,
  label,
  name,
  onValueChange,
  options,
  placeholder = 'Начните вводить',
  required,
  value,
}: ComboboxFieldProps) {
  const id = useId();
  const inputId = `${id}-input`;
  const hint = error ?? description;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <Combobox.Root
      defaultValue={defaultValue}
      disabled={disabled}
      id={id}
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => option.value}
      items={options}
      name={name}
      onValueChange={(nextValue) => onValueChange?.(nextValue)}
      required={required}
      value={value}
    >
      <div className={classNames(styles.field, className)}>
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
        <Combobox.InputGroup
          className={styles.inputGroup}
          data-invalid={error ? '' : undefined}
        >
          <Combobox.Input
            aria-describedby={hintId}
            aria-invalid={Boolean(error)}
            className={styles.input}
            id={inputId}
            placeholder={placeholder}
          />
          <Combobox.Trigger
            aria-label="Открыть список"
            className={styles.trigger}
          >
            <svg aria-hidden="true" viewBox="0 0 16 16">
              <path d="m4 6 4 4 4-4" />
            </svg>
          </Combobox.Trigger>
        </Combobox.InputGroup>
        {hint ? (
          <span
            className={classNames(styles.hint, error && styles.isError)}
            id={hintId}
          >
            {hint}
          </span>
        ) : null}
      </div>

      <Combobox.Portal>
        <Combobox.Positioner className={styles.positioner} sideOffset={6}>
          <Combobox.Popup className={styles.popup}>
            <Combobox.Empty className={styles.empty}>
              Ничего не найдено
            </Combobox.Empty>
            <Combobox.List className={styles.list}>
              {(option: ComboboxOption, index: number) => (
                <Combobox.Item
                  className={styles.item}
                  disabled={option.disabled}
                  key={option.value}
                  value={option}
                  index={index}
                >
                  <span>{option.label}</span>
                  <Combobox.ItemIndicator className={styles.indicator}>
                    ✓
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
