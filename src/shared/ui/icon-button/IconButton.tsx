import classNames from 'classnames';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import type { ButtonSize, ButtonVariant } from '../button/Button';
import buttonStyles from '../button/Button.module.scss';
import styles from './IconButton.module.scss';

const variantClassNames = {
  danger: buttonStyles.danger,
  ghost: buttonStyles.ghost,
  primary: buttonStyles.primary,
  secondary: buttonStyles.secondary,
} satisfies Record<ButtonVariant, string | undefined>;

const sizeClassNames = {
  large: styles.large,
  medium: styles.medium,
  small: styles.small,
} satisfies Record<ButtonSize, string | undefined>;

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children'
> {
  'aria-label': string;
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      children,
      className,
      size = 'medium',
      type = 'button',
      variant = 'secondary',
      ...props
    },
    ref,
  ) {
    return (
      <button
        className={classNames(
          buttonStyles.button,
          variantClassNames[variant],
          styles.iconButton,
          sizeClassNames[size],
          className,
        )}
        ref={ref}
        type={type}
        {...props}
      >
        {children}
      </button>
    );
  },
);
