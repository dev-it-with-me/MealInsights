/**
 * Enhanced Button component with Mantine styling
 */
import { Button as MantineButton } from '@mantine/core';
import type { ButtonProps as MantineButtonProps } from '@mantine/core';
import { clsx } from 'clsx';

interface ButtonProps extends MantineButtonProps {
  className?: string;
}

const Button = ({ 
  className, 
  children, 
  ...props 
}: ButtonProps) => {
  return (
    <MantineButton
      className={clsx(
        'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </MantineButton>
  );
};

export default Button;
