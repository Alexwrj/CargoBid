import classNames from 'classnames';
import type { ReactNode } from 'react';

import styles from './StateMessage.module.scss';

type StateMessageTone = 'neutral' | 'danger';

const toneClassNames = {
  danger: styles.danger,
  neutral: styles.neutral,
} satisfies Record<StateMessageTone, string | undefined>;

export interface StateMessageProps {
  action?: ReactNode;
  className?: string;
  description: string;
  icon?: ReactNode;
  title: string;
  tone?: StateMessageTone;
}

export function StateMessage({
  action,
  className,
  description,
  icon,
  title,
  tone = 'neutral',
}: StateMessageProps) {
  return (
    <section
      className={classNames(
        styles.stateMessage,
        toneClassNames[tone],
        className,
      )}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </section>
  );
}

export type EmptyStateProps = Omit<StateMessageProps, 'tone'>;

export function EmptyState(props: EmptyStateProps) {
  return <StateMessage {...props} tone="neutral" />;
}

export type ErrorStateProps = Omit<StateMessageProps, 'tone'>;

export function ErrorState(props: ErrorStateProps) {
  return <StateMessage {...props} tone="danger" />;
}
