import classNames from 'classnames';
import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';

import styles from './TextArea.module.scss';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  description?: string;
  error?: string;
  label: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      className,
      description,
      error,
      id: providedId,
      label,
      rows = 4,
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
        <textarea
          aria-describedby={describedBy}
          aria-invalid={Boolean(error) || undefined}
          className={classNames(styles.textArea, error && styles.invalid)}
          id={id}
          ref={ref}
          rows={rows}
          {...props}
        />
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
