// UI notifications API
export const notifications = {
	show: ({ title, message, color }: { title?: string; message?: string; color?: string }) => {
		// eslint-disable-next-line no-console
		console.log(`[${color || 'info'}] ${title || ''} ${message || ''}`.trim());
		alert(`${title ? title + '\n' : ''}${message || ''}`.trim());
	},
};

export const Notifications: React.FC<{ position?: string }> = () => null;

export default {} as any;
