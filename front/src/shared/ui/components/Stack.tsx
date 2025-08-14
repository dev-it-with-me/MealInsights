import React from 'react';
import { clsx } from 'clsx';
import { gapToClass } from '../internal/layoutUtils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'xs'|'sm'|'md'|'lg'|'xl'|number|string;
  align?: 'center' | 'start' | 'end';
  justify?: 'center' | 'start' | 'end';
  p?: number | string;
  mt?: number | string;
  mb?: number | string;
  py?: number | string;
  px?: number | string;
  h?: number | string;
}

export const Stack: React.FC<StackProps> = ({ gap='md', className, children, align, justify, p, mt, mb, py, px, style, h, ...rest }) => (
  <div
    {...rest}
  style={{ height: h, ...style }}
    className={clsx(
      'flex flex-col',
      gapToClass(gap),
      align === 'center' && 'items-center',
      justify === 'center' && 'justify-center',
      p && `p-${p}`,
      py && `py-${py}`,
      px && `px-${px}`,
      mt && `mt-${mt}`,
      mb && `mb-${mb}`,
      className,
    )}
  >
    {children}
  </div>
);

export default Stack;
