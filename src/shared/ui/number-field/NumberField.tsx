import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import classNames from 'classnames';
import { useId } from 'react';
import type { NumberFieldRootProps } from '@base-ui/react/number-field';

import styles from './NumberField.module.scss';

export interface NumberFieldProps extends Omit<
  NumberFieldRootProps,
  'children' | 'className'
> {
  className?: string;
  description?: string;
  error?: string;
  label: string;
  placeholder?: string;
}

export function NumberField({
  className,
  description,
  error,
  id: providedId,
  label,
  placeholder,
  ...props
}: NumberFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <BaseNumberField.Root
      className={classNames(styles.field, className)}
      id={id}
      {...props}
    >
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <BaseNumberField.Group
        className={classNames(styles.group, error && styles.invalid)}
      >
        <BaseNumberField.Input
          aria-describedby={describedBy}
          aria-invalid={Boolean(error) || undefined}
          className={styles.input}
          placeholder={placeholder}
        />
        <BaseNumberField.Decrement
          aria-label="Уменьшить"
          className={styles.stepButton}
        >
          −
        </BaseNumberField.Decrement>
        <BaseNumberField.Increment
          aria-label="Увеличить"
          className={styles.stepButton}
        >
          +
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
      {description && (
        <span className={styles.description} id={descriptionId}>
          {description}
        </span>
      )}
      {error && (
        <span className={styles.error} id={errorId}>
          {error}
        </span>
      )}
    </BaseNumberField.Root>
  );
}
