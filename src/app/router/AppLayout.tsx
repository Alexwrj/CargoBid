import { Link, NavLink, Outlet, useNavigation } from 'react-router-dom';

import { LoadingFallback } from '@/shared/ui/loading-fallback/LoadingFallback';

import styles from './AppLayout.module.scss';

const navigationItems = [
  { label: 'Аукционы', to: '/auctions' },
  { label: 'Пример деталей', to: '/auctions/demo-auction' },
  { label: 'Пример ставки', to: '/auctions/demo-auction/bet' },
  ...(import.meta.env.DEV ? [{ label: 'UI kit', to: '/ui-kit' }] : []),
];

export function AppLayout() {
  const navigation = useNavigation();

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
            {navigationItems.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.navigationLink} ${styles.isActive}`
                      : styles.navigationLink
                  }
                  end
                  to={to}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className={styles.appMain} id="main-content">
        {navigation.state === 'loading' ? <LoadingFallback /> : <Outlet />}
      </main>
    </div>
  );
}
