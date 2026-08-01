import classNames from 'classnames';
import type { CSSProperties, HTMLAttributes } from 'react';

import styles from './Skeleton.module.scss';

type SkeletonShape = 'text' | 'rectangle' | 'circle';

const shapeClassNames = {
  circle: styles.circle,
  rectangle: styles.rectangle,
  text: styles.text,
} satisfies Record<SkeletonShape, string | undefined>;

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  height?: CSSProperties['height'];
  shape?: SkeletonShape;
  width?: CSSProperties['width'];
}

export function Skeleton({
  className,
  height,
  shape = 'text',
  style,
  width,
  ...props
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={classNames(styles.skeleton, shapeClassNames[shape], className)}
      style={{ ...style, height, width }}
      {...props}
    />
  );
}
