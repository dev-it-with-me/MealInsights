/**
 * Enhanced Modal component with Mantine styling
 */
import { Modal as MantineModal } from '@mantine/core';

import type { ModalProps as MantineModalProps } from '@mantine/core';

/**
 * Props for wrapped Modal. Accepts `isOpen` alias for Mantine `opened`.
 */
/**
 * Props for wrapped Modal. Accepts both Mantine `opened` and alias `isOpen`.
 */
interface ModalProps extends MantineModalProps {
  children: React.ReactNode;
  /** Alias for `opened` */
  isOpen?: boolean;
}

const Modal = ({ children, isOpen, opened, ...props }: ModalProps & { opened?: boolean }) => {
  // Use alias isOpen if provided, else fall back to opened prop
  const actualOpened = isOpen !== undefined ? isOpen : opened;
  return (
    <MantineModal
      centered
      size="lg"
      opened={actualOpened}
      {...props}
    >
      {children}
    </MantineModal>
  );
};

export default Modal;
