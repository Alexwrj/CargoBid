import { Switch as BaseSwitch } from '@base-ui/react/switch';
import classNames from 'classnames';
import { useId } from 'react';
import type { SwitchRootProps } from '@base-ui/react/switch';

import styles from './Switch.module.scss';

export interface SwitchProps extends Omit<SwitchRootProps, 'className'> {
  className?: string;
  description?: string;
  label: string;
}

export function Switch({
  className,
  description,
  id: providedId,
  label,
  ...props
}: SwitchProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <label className={classNames(styles.field, className)} htmlFor={id}>
      <span className={styles.copy}>
        <span className={styles.label}>{label}</span>
        {description && (
          <span className={styles.description}>{description}</span>
        )}
      </span>
      <BaseSwitch.Root className={styles.switch} id={id} {...props}>
        <BaseSwitch.Thumb className={styles.thumb} />
      </BaseSwitch.Root>
    </label>
  );
}
