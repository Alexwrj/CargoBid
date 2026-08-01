import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import classNames from 'classnames';
import type { ReactNode } from 'react';

import styles from './Tabs.module.scss';

export interface TabItem {
  content: ReactNode;
  disabled?: boolean;
  label: ReactNode;
  value: string;
}

export interface TabsProps {
  className?: string;
  defaultValue?: string;
  items: readonly TabItem[];
  onValueChange?: (value: string) => void;
  value?: string;
}

export function Tabs({
  className,
  defaultValue,
  items,
  onValueChange,
  value,
}: TabsProps) {
  return (
    <BaseTabs.Root
      className={classNames(styles.tabs, className)}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={(nextValue) => onValueChange?.(String(nextValue))}
      value={value}
    >
      <BaseTabs.List className={styles.list}>
        {items.map((item) => (
          <BaseTabs.Tab
            className={styles.tab}
            disabled={item.disabled}
            key={item.value}
            value={item.value}
          >
            {item.label}
          </BaseTabs.Tab>
        ))}
        <BaseTabs.Indicator className={styles.indicator} />
      </BaseTabs.List>
      {items.map((item) => (
        <BaseTabs.Panel
          className={styles.panel}
          key={item.value}
          value={item.value}
        >
          {item.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}
