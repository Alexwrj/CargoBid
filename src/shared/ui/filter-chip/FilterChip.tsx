import classNames from 'classnames';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './FilterChip.module.scss';

export interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  count?: number;
  isSelected?: boolean;
  leadingIcon?: ReactNode;
}

export function FilterChip({
  children,
  className,
  count,
  isSelected = false,
  leadingIcon,
  type = 'button',
  ...props
}: FilterChipProps) {
  return (
    <button
      aria-pressed={isSelected}
      className={classNames(
        styles.filterChip,
        isSelected && styles.selected,
        className,
      )}
      type={type}
      {...props}
    >
      {leadingIcon}
      <span>{children}</span>
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </button>
  );
}
