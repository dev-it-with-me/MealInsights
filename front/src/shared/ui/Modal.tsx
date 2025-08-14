/** Modal wrapper (ui-kit compatible) */
import { Modal as KitModal } from '@/shared/ui-kit';

/**
 * Props for wrapped Modal. Accepts `isOpen` alias for Mantine `opened`.
 */
/**
 * Props for wrapped Modal. Accepts both Mantine `opened` and alias `isOpen`.
 */
interface ModalProps {
  children: React.ReactNode;
  /** Alias for `opened` */
  isOpen?: boolean;
  /** Mantine-compatible props used across app */
  opened?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  size?: string;
}

const Modal = ({ children, isOpen, opened, ...props }: ModalProps) => {
  // Use alias isOpen if provided, else fall back to opened prop
  const actualOpened = isOpen !== undefined ? isOpen : opened;
  return (
  <KitModal
      size="xl"
      // Our shim accepts boolean | undefined; ensure boolean
      opened={!!actualOpened}
      onClose={props.onClose ?? (() => {})}
      className="bg-surface-900 text-surface-50 border border-surface-700"
      {...props}
    >
      {children}
  </KitModal>
  );
};

export default Modal;
