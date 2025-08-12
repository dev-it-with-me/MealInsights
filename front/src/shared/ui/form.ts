import { useState, useMemo, useCallback } from 'react';

export interface UseFormOptions<T> {
	initialValues: T;
	validate?: Partial<Record<keyof T, (value: any) => string | null>>;
}

export const useForm = <T extends Record<string, any>>(options: UseFormOptions<T>) => {
	const [values, setValues] = useState<T>(options.initialValues);

	const getInputProps = useCallback((path: string, opts?: { type?: 'checkbox' }) => {
		return {
			value: path.split('.').reduce((acc: any, key: string) => acc?.[key], values),
			onChange: (e: any) => {
				const newVal = opts?.type === 'checkbox' ? !!e?.target?.checked : (e?.target?.value ?? e);
				setValues(prev => {
					const segments = path.split('.');
					const next: any = { ...prev };
					let ref = next;
					for (let i = 0; i < segments.length - 1; i++) {
						ref[segments[i]] = { ...(ref[segments[i]] ?? {}) };
						ref = ref[segments[i]];
					}
					ref[segments[segments.length - 1]] = newVal;
					return next;
				});
			},
		};
	}, [values]);

	const setFieldValue = useCallback((path: string, val: any) => {
		setValues(prev => {
			const segments = path.split('.');
			const next: any = { ...prev };
			let ref = next;
			for (let i = 0; i < segments.length - 1; i++) {
				ref[segments[i]] = { ...(ref[segments[i]] ?? {}) };
				ref = ref[segments[i]];
			}
			ref[segments[segments.length - 1]] = val;
			return next;
		});
	}, []);

	const reset = useCallback(() => setValues(options.initialValues), [options.initialValues]);

	const onSubmit = (cb: (vals: T) => void | Promise<void>) => (e: React.FormEvent) => {
		e.preventDefault();
		cb(values);
	};

	return useMemo(() => ({ values, setValues, getInputProps, setFieldValue, reset, onSubmit }), [values, getInputProps, setFieldValue, reset]);
};

export default {} as any;
