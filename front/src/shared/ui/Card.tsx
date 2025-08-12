/**
 * Enhanced Card component backed by Skeleton/Tailwind
 */
import { Paper } from '@/shared/ui-kit';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className, ...props }: CardProps & Record<string, unknown>) => {
  return (
    <Paper
      shadow="sm"
      p="md"
      withBorder
      className={clsx(
  'bg-surface-900 text-surface-50 border border-surface-700 rounded-lg hover:shadow-md transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {children}
    </Paper>
  );
};

export default Card;
