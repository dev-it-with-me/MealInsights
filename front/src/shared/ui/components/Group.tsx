import React from 'react';
import { clsx } from 'clsx';
import { gapToClass } from '../internal/layoutUtils';

export interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: 'space-between' | 'center' | 'start' | 'end' | 'flex-end' | 'flex-start';
  align?: 'center' | 'start' | 'end' | 'flex-start' | 'flex-end';
  gap?: 'xs'|'sm'|'md'|'lg'|number|string; // allow arbitrary values passed previously
  p?: number | string;
  px?: number | string;
  py?: number | string;
  mt?: number | string;
  mb?: number | string;
  h?: number | string;
  grow?: boolean;
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse' | string;
}

export const Group: React.FC<GroupProps> = ({ justify, align, gap='sm', className, children, p, px, py, mt, mb, h, style, grow, wrap, ...rest }) => (
  <div
    {...rest}
    style={{ height: h, ...style }}
    className={clsx(
      'flex flex-row',
      (wrap ?? 'wrap') && `flex-${wrap ?? 'wrap'}`,
      justify && (justify === 'space-between' ? 'justify-between' : justify === 'flex-end' ? 'justify-end' : justify === 'flex-start' ? 'justify-start' : `justify-${justify}`),
      align && (align === 'flex-start' ? 'items-start' : align === 'flex-end' ? 'items-end' : align === 'center' && 'items-center'),
      gapToClass(gap as any),
      p && `p-${p}`,
      px && `px-${px}`,
      py && `py-${py}`,
      mt && `mt-${mt}`,
      mb && `mb-${mb}`,
      grow && 'flex-1',
      className,
    )}
  >
    {children}
  </div>
);

export default Group;
