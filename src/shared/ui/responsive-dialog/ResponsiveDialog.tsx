import { Dialog } from '@base-ui/react/dialog';
import type { ReactElement, ReactNode } from 'react';

import { IconButton } from '@/shared/ui/icon-button/IconButton';

import styles from './ResponsiveDialog.module.scss';

export interface ResponsiveDialogProps {
  children: ReactNode;
  defaultOpen?: boolean;
  description?: string;
  footer?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  title: string;
  trigger?: ReactElement;
}

export function ResponsiveDialog({
  children,
  defaultOpen,
  description,
  footer,
  onOpenChange,
  open,
  title,
  trigger,
}: ResponsiveDialogProps) {
  return (
    <Dialog.Root
      defaultOpen={defaultOpen}
      onOpenChange={(nextOpen) => onOpenChange?.(nextOpen)}
      open={open}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Viewport className={styles.viewport}>
          <Dialog.Popup className={styles.popup}>
            <header className={styles.header}>
              <div className={styles.heading}>
                <Dialog.Title className={styles.title}>{title}</Dialog.Title>
                {description ? (
                  <Dialog.Description className={styles.description}>
                    {description}
                  </Dialog.Description>
                ) : null}
              </div>
              <Dialog.Close
                render={<IconButton aria-label="Закрыть диалог">×</IconButton>}
              />
            </header>
            <div className={styles.content}>{children}</div>
            {footer ? (
              <footer className={styles.footer}>{footer}</footer>
            ) : null}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
