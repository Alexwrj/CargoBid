import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ReactElement, ReactNode } from 'react';

import styles from './Tooltip.module.scss';

export interface TooltipProps {
  children: ReactNode;
  trigger: ReactElement;
}

export function Tooltip({ children, trigger }: TooltipProps) {
  return (
    <BaseTooltip.Provider delay={350}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger render={trigger} />
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner className={styles.positioner} sideOffset={8}>
            <BaseTooltip.Popup className={styles.popup}>
              {children}
              <BaseTooltip.Arrow className={styles.arrow} />
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
}
