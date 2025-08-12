// Minimal modals API
import React from 'react';
export const modals = {
	openConfirmModal: ({ title, children, onConfirm }: { title?: string; children?: any; onConfirm?: () => void }) => {
		const message = `${title ? title + '\n' : ''}${typeof children === 'string' ? children : ''}`.trim();
		if (confirm(message || 'Are you sure?')) onConfirm?.();
	},
};

export const ModalsProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <>{children}</>;

export default {} as any;
