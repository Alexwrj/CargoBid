import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';

import styles from './Badge.module.scss';

export type BadgeTone =
  'neutral' | 'accent' | 'success' | 'danger' | 'warning' | 'info';

const toneClassNames = {
  accent: styles.accent,
  danger: styles.danger,
  info: styles.info,
  neutral: styles.neutral,
  success: styles.success,
  warning: styles.warning,
} satisfies Record<BadgeTone, string | undefined>;

const appearanceClassNames = {
  soft: styles.soft,
  solid: styles.solid,
} satisfies Record<'soft' | 'solid', string | undefined>;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  appearance?: 'soft' | 'solid';
  children: ReactNode;
  showDot?: boolean;
  tone?: BadgeTone;
}

export function Badge({
  appearance = 'soft',
  children,
  className,
  showDot = false,
  tone = 'neutral',
  ...props
}: BadgeProps) {
  return (
    <span
      className={classNames(
        styles.badge,
        toneClassNames[tone],
        appearanceClassNames[appearance],
        className,
      )}
      {...props}
    >
      {showDot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
