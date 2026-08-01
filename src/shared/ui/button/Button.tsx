import classNames from 'classnames';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

const variantClassNames = {
  danger: styles.danger,
  ghost: styles.ghost,
  primary: styles.primary,
  secondary: styles.secondary,
} satisfies Record<ButtonVariant, string | undefined>;

const sizeClassNames = {
  large: styles.large,
  medium: styles.medium,
  small: styles.small,
} satisfies Record<ButtonSize, string | undefined>;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  size?: ButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      disabled,
      endIcon,
      fullWidth = false,
      isLoading = false,
      loadingLabel = 'Загрузка',
      size = 'medium',
      startIcon,
      type = 'button',
      variant = 'primary',
      ...props
    },
    ref,
  ) {
    return (
      <button
        className={classNames(
          styles.button,
          variantClassNames[variant],
          sizeClassNames[size],
          fullWidth && styles.fullWidth,
          className,
        )}
        disabled={disabled || isLoading}
        ref={ref}
        type={type}
        {...props}
      >
        {isLoading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : (
          startIcon
        )}
        <span>{isLoading ? loadingLabel : children}</span>
        {!isLoading && endIcon}
      </button>
    );
  },
);
