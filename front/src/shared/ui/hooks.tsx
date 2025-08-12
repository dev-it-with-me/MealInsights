import { useState, useCallback } from 'react';

export const useDisclosure = (initial = false) => {
	const [opened, setOpened] = useState<boolean>(initial);
	const toggle = useCallback(() => setOpened(o => !o), []);
	const open = useCallback(() => setOpened(true), []);
	const close = useCallback(() => setOpened(false), []);
	return [opened, { toggle, open, close }] as const;
};

export const useDebouncedValue = (value: any, _delay = 300) => {
	// simple passthrough; consumers often use only value
	return [value, { cancel: () => {} }] as const;
};

export default {} as any;
