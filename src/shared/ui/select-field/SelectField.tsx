import { Select } from '@base-ui/react/select';
import classNames from 'classnames';
import { useId } from 'react';

import styles from './SelectField.module.scss';

export interface SelectOption {
  disabled?: boolean;
  label: string;
  value: string;
}

export interface SelectFieldProps {
  className?: string;
  defaultValue?: string | null;
  description?: string;
  disabled?: boolean;
  error?: string;
  label: string;
  name?: string;
  onValueChange?: (value: string | null) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  required?: boolean;
  value?: string | null;
}

export function SelectField({
  className,
  defaultValue,
  description,
  disabled,
  error,
  label,
  name,
  onValueChange,
  options,
  placeholder = 'Выберите значение',
  required,
  value,
}: SelectFieldProps) {
  const id = useId();
  const hint = error ?? description;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <Select.Root
      defaultValue={defaultValue}
      disabled={disabled}
      id={id}
      items={options}
      name={name}
      onValueChange={(nextValue) => onValueChange?.(nextValue)}
      required={required}
      value={value}
    >
      <div className={classNames(styles.field, className)}>
        <Select.Label className={styles.label}>{label}</Select.Label>
        <Select.Trigger
          aria-describedby={hintId}
          aria-invalid={Boolean(error)}
          className={styles.trigger}
        >
          <Select.Value className={styles.value} placeholder={placeholder} />
          <Select.Icon className={styles.icon}>
            <svg aria-hidden="true" viewBox="0 0 16 16">
              <path d="m4 6 4 4 4-4" />
            </svg>
          </Select.Icon>
        </Select.Trigger>
        {hint ? (
          <span
            className={classNames(styles.hint, error && styles.isError)}
            id={hintId}
          >
            {hint}
          </span>
        ) : null}
      </div>

      <Select.Portal>
        <Select.Positioner className={styles.positioner} sideOffset={6}>
          <Select.Popup className={styles.popup}>
            <Select.List className={styles.list}>
              {options.map((option) => (
                <Select.Item
                  className={styles.item}
                  disabled={option.disabled}
                  key={option.value}
                  value={option.value}
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className={styles.indicator}>
                    ✓
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
