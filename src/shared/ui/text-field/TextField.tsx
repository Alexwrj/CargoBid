import classNames from 'classnames';
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import styles from './TextField.module.scss';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  description?: string;
  endAdornment?: ReactNode;
  error?: string;
  label: string;
  startAdornment?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      className,
      description,
      endAdornment,
      error,
      id: providedId,
      label,
      startAdornment,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy =
      [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <label className={classNames(styles.field, className)} htmlFor={id}>
        <span className={styles.label}>{label}</span>
        <span className={classNames(styles.control, error && styles.invalid)}>
          {startAdornment && (
            <span className={styles.adornment}>{startAdornment}</span>
          )}
          <input
            aria-describedby={describedBy}
            aria-invalid={Boolean(error) || undefined}
            className={styles.input}
            id={id}
            ref={ref}
            {...props}
          />
          {endAdornment && (
            <span className={styles.adornment}>{endAdornment}</span>
          )}
        </span>
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
      </label>
    );
  },
);
