import { Link } from '@tanstack/react-router';

import type { AuctionListCardView } from '@/entities/auction/model/auction-list-presenter';
import { Badge } from '@/shared/ui/badge/Badge';

import styles from './AuctionListCard.module.scss';

interface AuctionListCardProps {
  auction: AuctionListCardView;
}

function CardContent({ auction }: AuctionListCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.summary}>
        <header className={styles.header}>
          <div className={styles.identifiers}>
            <span className={styles.reference}>№ {auction.reference}</span>
            <Badge tone={auction.auctionStatus.tone}>
              {auction.auctionStatus.label}
            </Badge>
          </div>
          <Badge tone={auction.userStatus.tone}>
            {auction.userStatus.label}
          </Badge>
        </header>

        <div className={styles.routeBlock}>
          <h2 className={styles.route}>{auction.route}</h2>
          {auction.routePoints ? (
            <span className={styles.routePoints}>{auction.routePoints}</span>
          ) : null}
        </div>

        <dl className={styles.dates}>
          <div>
            <dt>Погрузка</dt>
            <dd>{auction.loadDate}</dd>
          </div>
          <div>
            <dt>Выгрузка</dt>
            <dd>{auction.unloadDate}</dd>
          </div>
        </dl>

        <div className={styles.cargo}>
          <strong>{auction.cargoName}</strong>
          {auction.cargoDetails.length > 0 ? (
            <ul className={styles.cargoDetails}>
              {auction.cargoDetails.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <footer className={styles.meta}>
          <span>{auction.organizer}</span>
          <span>{auction.auctionType}</span>
        </footer>
      </div>

      <aside className={styles.commercial}>
        <div>
          <span className={styles.priceCaption}>
            {auction.currentPriceCaption}
          </span>
          <strong className={styles.price}>{auction.currentPrice}</strong>
        </div>
        {auction.yourBet ? (
          <span className={styles.yourBet}>{auction.yourBet}</span>
        ) : null}
        <span className={styles.endTime}>{auction.endTime}</span>
        <span className={styles.action}>{auction.actionLabel} →</span>
      </aside>
    </article>
  );
}

export function AuctionListCard({ auction }: AuctionListCardProps) {
  if (!auction.auctionUuid) {
    return (
      <div aria-disabled="true" className={styles.cardUnavailable}>
        <CardContent auction={auction} />
      </div>
    );
  }

  return (
    <Link
      aria-label={`Открыть ${auction.reference}: ${auction.route}`}
      className={styles.cardLink}
      params={{ auctionUuid: auction.auctionUuid }}
      to="/auctions/$auctionUuid"
    >
      <CardContent auction={auction} />
    </Link>
  );
}
