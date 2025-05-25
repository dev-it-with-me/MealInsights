/**
 * Enhanced Modal component with Mantine styling
 */
import { Modal as MantineModal } from '@mantine/core';
import type { ModalProps as MantineModalProps } from '@mantine/core';

interface ModalProps extends MantineModalProps {
  children: React.ReactNode;
}

const Modal = ({ children, ...props }: ModalProps) => {
  return (
    <MantineModal
      centered
      size="lg"
      {...props}
    >
      {children}
    </MantineModal>
  );
};

export default Modal;
