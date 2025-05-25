/**
 * Enhanced Card component with Mantine styling
 */
import { Paper } from '@mantine/core';
import type { PaperProps } from '@mantine/core';
import { clsx } from 'clsx';

interface CardProps extends PaperProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <Paper
      shadow="sm"
      p="md"
      withBorder
      className={clsx(
        'bg-white rounded-lg hover:shadow-md transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {children}
    </Paper>
  );
};

export default Card;
