export const sizeToMaxWidth = (size?: string) => {
  switch (size) {
    case 'sm': return 'max-w-screen-sm';
    case 'md': return 'max-w-screen-md';
    case 'lg': return 'max-w-screen-lg';
    case 'xl': return 'max-w-screen-xl';
    default: return '';
  }
};

export const gapToClass = (gap?: string|number) => {
  if (typeof gap === 'number') return `gap-[${gap}px]`;
  switch (gap) {
    case 'xs': return 'gap-1';
    case 'sm': return 'gap-2';
    case 'md': return 'gap-4';
    case 'lg': return 'gap-6';
    case 'xl': return 'gap-8';
    default: return typeof gap === 'string' ? `gap-[${gap}]` : 'gap-4';
  }
};
