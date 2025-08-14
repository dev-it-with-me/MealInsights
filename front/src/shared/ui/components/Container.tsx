import React from 'react';
import { clsx } from 'clsx';
import { sizeToMaxWidth } from '../internal/layoutUtils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm'|'md'|'lg'|'xl';
  py?: number | string;
  px?: number | string;
}

export const Container: React.FC<ContainerProps> = ({ size='lg', py, px, className, children, ...rest }) => (
  <div
    {...rest}
    className={clsx(
      sizeToMaxWidth(size),
      'mx-auto',
      px != null ? (typeof px === 'number' ? `px-[${px}px]` : `px-${px}`) : 'px-4',
      py && `py-${py}`,
      className,
    )}
  >
    {children}
  </div>
);

export default Container;
