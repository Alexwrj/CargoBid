import { Link, Outlet } from '@tanstack/react-router';

import styles from './AppLayout.module.scss';

export function AppLayout() {
  return (
    <div className={styles.appShell}>
      <a className={styles.skipLink} href="#main-content">
        Перейти к содержимому
      </a>

      <header className={styles.appHeader}>
        <Link
          aria-label="CargoBid — главная"
          className={styles.brand}
          to="/auctions"
        >
          CargoBid
        </Link>
        <nav aria-label="Основная навигация">
          <ul className={styles.navigation}>
            <li>
              <Link
                activeOptions={{ exact: true }}
                activeProps={{ className: styles.isActive }}
                className={styles.navigationLink}
                to="/auctions"
              >
                Аукционы
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className={styles.appMain} id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
