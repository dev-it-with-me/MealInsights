// Central color resolution helper
export interface ResolvedColorVars {
  base: string; // main token var name
  strong: string; // stronger shade
  contrast: string; // contrast token var name
}

export const resolveColorVars = (color?: string): ResolvedColorVars => {
  switch (color) {
    case 'primary':
    case undefined:
      return { base: '--color-primary-500', strong: '--color-primary-600', contrast: '--color-primary-contrast-light' };
    case 'secondary':
    case 'blue':
      return { base: '--color-secondary-500', strong: '--color-secondary-600', contrast: '--color-secondary-contrast-light' };
    case 'tertiary':
      return { base: '--color-tertiary-500', strong: '--color-tertiary-600', contrast: '--color-tertiary-contrast-light' };
    case 'green':
    case 'success':
      return { base: '--color-success-500', strong: '--color-success-600', contrast: '--color-success-contrast-light' };
    case 'red':
    case 'error':
      return { base: '--color-error-500', strong: '--color-error-600', contrast: '--color-error-contrast-light' };
    case 'yellow':
    case 'warning':
      return { base: '--color-warning-500', strong: '--color-warning-600', contrast: '--color-warning-contrast-light' };
    case 'gray':
    case 'neutral':
      return { base: '--color-surface-500', strong: '--color-surface-400', contrast: '--color-surface-contrast-light' };
    default:
      return { base: '--color-primary-500', strong: '--color-primary-600', contrast: '--color-primary-contrast-light' };
  }
};
