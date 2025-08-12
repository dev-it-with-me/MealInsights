/** Loading spinner component */
import { Loader } from '@/shared/ui-kit';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  return (
    <div className={clsx('flex justify-center items-center', className)}>
      <Loader size={size} />
    </div>
  );
};

export default LoadingSpinner;
