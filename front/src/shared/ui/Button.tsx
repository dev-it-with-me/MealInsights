/**
 * Enhanced Button component backed by Skeleton/Tailwind
 */
import { Button as KitButton } from '@/shared/ui-kit';
import { clsx } from 'clsx';

interface ButtonProps extends React.ComponentProps<typeof KitButton> {
  className?: string;
}

const Button = ({ 
  className, 
  children, 
  ...props 
}: ButtonProps) => {
  return (
  <KitButton
      className={clsx(
        'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
  </KitButton>
  );
};

export default Button;
