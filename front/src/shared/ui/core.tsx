// UI core built with Skeleton/Tailwind primitives
import React from 'react';
import ReactDOM from 'react-dom';
import { clsx } from 'clsx';

const sizeToMaxWidth = (size?: string) => {
	switch (size) {
		case 'sm': return 'max-w-screen-sm';
		case 'md': return 'max-w-screen-md';
		case 'lg': return 'max-w-screen-lg';
		case 'xl': return 'max-w-screen-xl';
		default: return '';
	}
};

// Color resolver mapping semantic names to theme CSS variables
const resolveColorVars = (color?: string) => {
	switch (color) {
		case 'primary':
		case undefined:
			return { base: '--color-primary-500', strong: '--color-primary-600', contrast: '--color-primary-contrast-light' };
		case 'secondary':
		case 'blue':
			return { base: '--color-secondary-500', strong: '--color-secondary-600', contrast: '--color-secondary-contrast-light' };
		case 'tertiary':
			return { base: '--color-tertiary-500', strong: '--color-tertiary-600', contrast: '--color-tertiary-contrast-light' };
		case 'green':
		case 'success':
			return { base: '--color-success-500', strong: '--color-success-600', contrast: '--color-success-contrast-light' };
		case 'red':
		case 'error':
			return { base: '--color-error-500', strong: '--color-error-600', contrast: '--color-error-contrast-light' };
		case 'yellow':
		case 'warning':
			return { base: '--color-warning-500', strong: '--color-warning-600', contrast: '--color-warning-contrast-light' };
		case 'gray':
		case 'neutral':
			return { base: '--color-surface-500', strong: '--color-surface-400', contrast: '--color-surface-contrast-light' };
		default:
			return { base: '--color-primary-500', strong: '--color-primary-600', contrast: '--color-primary-contrast-light' };
	}
};

export const Container: React.FC<any> = ({ size='lg', py, px, className, children, ...rest }) => (
	<div
		{...rest}
		className={clsx(
			sizeToMaxWidth(size),
			'mx-auto',
			px != null ? (typeof px === 'number' ? `px-[${px}px]` : `px-${px}`) : 'px-4',
			py && `py-${py}`,
			className,
		)}
	>
		{children}
	</div>
);

const gapToClass = (gap?: string|number) => {
	if (typeof gap === 'number') return `gap-[${gap}px]`;
	switch (gap) {
		case 'xs': return 'gap-1';
		case 'sm': return 'gap-2';
		case 'md': return 'gap-4';
		case 'lg': return 'gap-6';
		default: return 'gap-4';
	}
};

export const Stack: React.FC<any> = ({ gap='md', className, children, align, justify, p, mt, mb, py, px, style, ...rest }) => (
	<div
		{...rest}
		style={style}
		className={clsx(
			'flex flex-col',
			gapToClass(gap),
			align === 'center' && 'items-center',
			justify === 'center' && 'justify-center',
			p && `p-${p}`,
			py && `py-${py}`,
			px && `px-${px}`,
			mt && `mt-${mt}`,
			mb && `mb-${mb}`,
			className,
		)}
	>
		{children}
	</div>
);

export const Group: React.FC<any> = ({ justify, align, gap='sm', className, children, p, px, py, mt, mb, h, style, grow, ...rest }) => (
	<div
		{...rest}
		style={{ height: h, ...style }}
		className={clsx(
			'flex flex-row flex-wrap',
			justify==='space-between' && 'justify-between',
			justify==='center' && 'justify-center',
			align==='center' && 'items-center',
			gapToClass(gap),
			p && `p-${p}`,
			px && `px-${px}`,
			py && `py-${py}`,
			mt && `mt-${mt}`,
			mb && `mb-${mb}`,
			grow && 'flex-1',
			className,
		)}
	>
		{children}
	</div>
);

export const Title: React.FC<any> = ({ order=2, className, children, c, mb }) => {
	const sizeClass = order===1?'text-3xl':order===2?'text-2xl':order===3?'text-xl':'text-lg';
	const cls = clsx('font-bold', sizeClass, c==='dimmed' && 'text-surface-400', mb && `mb-${mb}`, className);
	if (order === 1) return <h1 className={cls}>{children}</h1>;
	if (order === 2) return <h2 className={cls}>{children}</h2>;
	if (order === 3) return <h3 className={cls}>{children}</h3>;
	if (order === 4) return <h4 className={cls}>{children}</h4>;
	if (order === 5) return <h5 className={cls}>{children}</h5>;
	return <h6 className={cls}>{children}</h6>;
};

export const Text: React.FC<any> = ({ size='md', c, color, ta, fw, className, children, mb, mt, opacity, tt, p, style, ...rest }) => (
	<span
		{...rest}
		style={{ opacity, padding: p, textAlign: ta, ...style }}
		className={clsx(
			size==='xs'?'text-xs':size==='sm'?'text-sm':size==='lg'?'text-lg':'text-base',
			(c==='dimmed' || color==='dimmed') && 'text-surface-400',
			fw && `font-[${fw}]`,
			tt==='uppercase' && 'uppercase',
			mb && `mb-${mb}`,
			mt && `mt-${mt}`,
			className,
		)}
	>{children}</span>
);

export const Paper: React.FC<any> = ({ withBorder, p='md', shadow='sm', className, children, mb, h, style, bg, ...rest }) => (
	<div
		{...rest}
		style={{ height: h, backgroundColor: bg, ...style }}
		className={clsx('card bg-surface-900 text-surface-50', withBorder && 'border border-surface-700',
			p===0?'p-0':p==='xs'?'p-1':p==='sm'?'p-2':p==='md'?'p-4':p==='lg'?'p-6': typeof p==='number'?`p-[${p}px]`:`p-${p}`,
			shadow && 'shadow',
			mb && `mb-${mb}`,
			className)}>{children}</div>
);

export const Badge: React.FC<any> = ({ size='sm', variant='light', color='primary', className, children }) => {
	const sizeCls = size==='xs'?'text-[10px] px-2 py-0.5': size==='lg'? 'text-sm px-3 py-1':'text-xs px-2.5 py-0.5';
	const vars = resolveColorVars(color);
	const baseCls = 'inline-flex items-center rounded-full font-medium';
	let styles = 'border border-surface-700 bg-surface-800 text-surface-100';
	if (variant==='outline') styles = `border border-[var(${vars.base})] text-[var(${vars.base})]`;
	if (variant==='dot') styles = 'border border-surface-700 bg-surface-900 text-surface-100 relative pl-5';
	return (
		<span className={clsx(baseCls, sizeCls, styles, className)}>
			{variant==='dot' && <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(${vars.base})` }} />}
			{children}
		</span>
	);
};

export type ButtonProps = any;
export const Button: React.FC<any> = ({ leftSection, variant='filled', size='md', loading, className, children, fullWidth, color='primary', disabled, ...rest }) => {
	const sizeCls = size==='xs' ? 'text-xs px-2.5 py-1' : size==='sm' ? 'text-sm px-3 py-1.5' : size==='lg' ? 'text-base px-5 py-2.5' : 'text-sm px-4 py-2';
	const filledMap: Record<string, string> = {
		primary: 'bg-[var(--color-primary-600)] text-[var(--color-primary-contrast-light)] border-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)]',
		secondary: 'bg-[var(--color-secondary-600)] text-[var(--color-secondary-contrast-light)] border-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-500)]',
		tertiary: 'bg-[var(--color-tertiary-600)] text-[var(--color-tertiary-contrast-light)] border-[var(--color-tertiary-500)] hover:bg-[var(--color-tertiary-500)]',
		success: 'bg-[var(--color-success-600)] text-[var(--color-success-contrast-light)] border-[var(--color-success-500)] hover:bg-[var(--color-success-500)]',
		green: 'bg-[var(--color-success-600)] text-[var(--color-success-contrast-light)] border-[var(--color-success-500)] hover:bg-[var(--color-success-500)]',
		error: 'bg-[var(--color-error-600)] text-[var(--color-error-contrast-light)] border-[var(--color-error-500)] hover:bg-[var(--color-error-500)]',
		red: 'bg-[var(--color-error-600)] text-[var(--color-error-contrast-light)] border-[var(--color-error-500)] hover:bg-[var(--color-error-500)]',
		warning: 'bg-[var(--color-warning-600)] text-[var(--color-warning-contrast-light)] border-[var(--color-warning-500)] hover:bg-[var(--color-warning-500)]',
		yellow: 'bg-[var(--color-warning-600)] text-[var(--color-warning-contrast-light)] border-[var(--color-warning-500)] hover:bg-[var(--color-warning-500)]',
		neutral: 'bg-surface-700 text-surface-50 border-surface-600 hover:bg-surface-600',
		gray: 'bg-surface-700 text-surface-50 border-surface-600 hover:bg-surface-600',
	};
	const outlineMap: Record<string, string> = {
		primary: 'bg-transparent text-[var(--color-primary-500)] border-[var(--color-primary-500)] hover:bg-surface-800',
		secondary: 'bg-transparent text-[var(--color-secondary-500)] border-[var(--color-secondary-500)] hover:bg-surface-800',
		tertiary: 'bg-transparent text-[var(--color-tertiary-500)] border-[var(--color-tertiary-500)] hover:bg-surface-800',
		success: 'bg-transparent text-[var(--color-success-500)] border-[var(--color-success-500)] hover:bg-surface-800',
		green: 'bg-transparent text-[var(--color-success-500)] border-[var(--color-success-500)] hover:bg-surface-800',
		error: 'bg-transparent text-[var(--color-error-500)] border-[var(--color-error-500)] hover:bg-surface-800',
		red: 'bg-transparent text-[var(--color-error-500)] border-[var(--color-error-500)] hover:bg-surface-800',
		warning: 'bg-transparent text-[var(--color-warning-500)] border-[var(--color-warning-500)] hover:bg-surface-800',
		yellow: 'bg-transparent text-[var(--color-warning-500)] border-[var(--color-warning-500)] hover:bg-surface-800',
		neutral: 'bg-transparent text-surface-200 border-surface-600 hover:bg-surface-800',
		gray: 'bg-transparent text-surface-200 border-surface-600 hover:bg-surface-800',
	};
	const baseCls = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 border focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-opacity-40';
	const variantCls = variant==='outline'
		? (outlineMap[color] || outlineMap.primary)
		: variant==='light' || variant==='subtle'
			? 'bg-surface-800 text-surface-50 border-surface-700 hover:bg-surface-700'
			: (filledMap[color] || filledMap.primary);
	return (
		<button
			{...rest}
			disabled={disabled}
			className={clsx(baseCls, sizeCls, variantCls, fullWidth && 'w-full', disabled && 'opacity-50 cursor-not-allowed', className)}
		>
			{leftSection && <span className="mr-1.5 inline-flex items-center">{leftSection}</span>}
			{loading && <span className="loading loading-spinner mr-1.5"></span>}
			{children}
		</button>
	);
};

export const Modal: React.FC<any> = ({ opened, onClose, title, children, size = 'md' }) => {
	React.useEffect(() => {
		if (!opened) return;
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [opened, onClose]);
	if (!opened) return null;
	const sizeCls = size === 'xs'
		? 'max-w-sm'
		: size === 'sm'
			? 'max-w-md'
			: size === 'lg'
				? 'max-w-2xl'
				: size === 'xl'
					? 'max-w-4xl'
					: 'max-w-lg'; // default 'md'
	const node = (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/60" onClick={onClose} />
			<div
				role="dialog"
				aria-modal="true"
				className={clsx("relative mx-4 w-full rounded-lg border border-surface-700 bg-surface-900 text-surface-50 p-4 shadow-xl", sizeCls)}
				onClick={(e) => e.stopPropagation()}
			>
				{title && <div className="font-bold text-lg mb-3">{title}</div>}
				<div className="max-h-[75vh] overflow-y-auto pr-1">
					{children}
				</div>
				<div className="mt-4 flex justify-end">
					<button className="inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 border bg-surface-800 text-surface-50 border-surface-700 hover:bg-surface-700 px-4 py-2" onClick={onClose}>Close</button>
				</div>
			</div>
		</div>
	);
	return ReactDOM.createPortal(node, document.body);
};

export const TextInput: React.FC<any> = (props) => <input {...props} className={clsx('input input-bordered w-full bg-surface-900 text-surface-50 placeholder-surface-400 border-surface-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-opacity-40', props.className)} />;
export const Textarea: React.FC<any> = (props) => <textarea {...props} className={clsx('textarea textarea-bordered w-full bg-surface-900 text-surface-50 placeholder-surface-400 border-surface-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-opacity-40', props.className)} />;
export const NumberInput: React.FC<any> = (props) => <input type="number" {...props} className={clsx('input input-bordered w-full bg-surface-900 text-surface-50 placeholder-surface-400 border-surface-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-opacity-40', props.className)} />;
export const MultiSelect: React.FC<any> = ({
	data = [],
	value = [],
	onChange,
	label,
	placeholder,
	searchable,
	clearable,
	disabled,
	className,
	...rest
}: any) => {
	const [query, setQuery] = React.useState('');
	const values: string[] = Array.isArray(value) ? value : [];
	const filtered = Array.isArray(data)
		? data.filter((d: any) =>
			String(d.label ?? d.value ?? '')
				.toLowerCase()
				.includes(query.toLowerCase())
		  )
		: [];
	const toggle = (val: string) => {
		if (disabled) return;
		const next = values.includes(val)
			? values.filter((v) => v !== val)
			: [...values, val];
		onChange?.(next);
	};
	const clear = () => onChange?.([]);
	return (
		<div className={clsx('w-full', className)} {...rest}>
			{label && (
				<div className="mb-1 flex items-center justify-between">
					<span className="text-sm text-surface-300">{label}</span>
					{clearable && values.length > 0 && (
						<button type="button" className="text-xs text-surface-400 hover:text-surface-200" onClick={clear} disabled={disabled}>Clear</button>
					)}
				</div>
			)}
			{searchable && (
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder={placeholder || 'Search...'}
					disabled={disabled}
					className="input input-bordered w-full mb-2 bg-surface-900 text-surface-50 placeholder-surface-400 border-surface-700"
				/>
			)}
			{!searchable && placeholder && values.length === 0 && (
				<div className="text-xs text-surface-400 mb-2">{placeholder}</div>
			)}
			<div className={clsx(
				'rounded-md border border-surface-700 bg-surface-900 p-2',
				disabled && 'opacity-60 pointer-events-none'
			)}>
				{filtered.length === 0 ? (
					<div className="text-xs text-surface-400 p-2">No options</div>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-auto">
						{filtered.map((o: any) => {
							const selected = values.includes(o.value);
							return (
								<button
									type="button"
									key={o.value}
									onClick={() => toggle(o.value)}
									aria-pressed={selected}
									className={clsx(
										'w-full text-left px-3 py-2 rounded-md border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-opacity-40',
										selected
											? 'border-[var(--color-primary-500)] bg-surface-800'
											: 'border-surface-700 bg-surface-900 hover:bg-surface-800'
									)}
								>
									<span className={clsx('text-sm', selected ? 'text-surface-100' : 'text-surface-200')}>{o.label}</span>
								</button>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};
export const Switch: React.FC<any> = ({ label, ...rest }) => (
	<label className="label cursor-pointer flex items-center gap-2">
		<span className="label-text">{label}</span>
		<input type="checkbox" className="toggle" {...rest} />
	</label>
);
export const Divider: React.FC<any> = ({ label, my }) => <div className={clsx('divider', my && `my-${my}`)}>{label}</div>;
export const ScrollArea: any = { Autosize: ({ children }: any) => <div className="max-h-[70vh] overflow-auto">{children}</div> };
export const Grid: any = ({ children }: any) => <div className="grid grid-cols-12 gap-4">{children}</div>;
Grid.Col = ({ span, children }: any) => {
	const spanClass = typeof span === 'number' ? `col-span-${span}` : 'col-span-12';
	return <div className={spanClass}>{children}</div>;
};
export const Card: React.FC<any> = ({ children, className, withBorder, p='md', ...rest }) => (
	<div
		{...rest}
		className={clsx('card bg-surface-900 text-surface-50', withBorder && 'border border-surface-700', p==='sm'?'p-2':p==='md'?'p-4':'p-6', className)}
	>
		{children}
	</div>
);
// Add Card.Section for compatibility
// @ts-expect-error augmenting function component
Card.Section = ({ children }: any) => <div className="p-0">{children}</div>;
export const ActionIcon: React.FC<React.PropsWithChildren<{ onClick?: () => void; color?: string; variant?: string; size?: 'xs'|'sm'|'md'; disabled?: boolean; loading?: boolean }>> = ({ children, onClick, disabled, loading, size='sm' }) => {
	const sizeCls = size==='xs' ? 'h-7 w-7' : size==='md' ? 'h-10 w-10' : 'h-8 w-8';
	return (
		<button onClick={onClick} disabled={disabled} className={clsx('inline-flex items-center justify-center rounded-md border border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-50 transition-colors', sizeCls, disabled && 'opacity-50 cursor-not-allowed')}>
			{loading && <span className="loading loading-spinner mr-1"></span>}
			{children}
		</button>
	);
};
export const Alert: React.FC<any> = ({ title, children, icon, color='blue', m }) => {
	const colorVar = color==='red' ? '--color-error-500' : color==='green' ? '--color-success-500' : color==='yellow' ? '--color-warning-500' : '--color-primary-500';
	return (
		<div className={clsx('rounded-md border p-3 flex gap-2 items-start', m && `m-${m}`)} style={{ borderColor: `var(${colorVar})`, backgroundColor: 'var(--color-surface-900)' }}>
			{icon && <div className="mt-0.5 text-surface-200">{icon}</div>}
			<div>
				{title && <div className="font-semibold text-surface-100">{title}</div>}
				<div className="text-surface-200">{children}</div>
			</div>
		</div>
	);
};
export const Loader: React.FC<{ size?: any }> = () => <span className="loading loading-spinner" />;
export const SegmentedControl: React.FC<any> = ({ data, value, onChange }) => (
	<div className="inline-flex rounded-md border border-surface-700 overflow-hidden">
		{data?.map((d: any, i: number) => (
			<button
				key={d.value}
				onClick={() => onChange(d.value)}
				className={clsx(
					'px-3 py-1.5 text-sm transition-colors',
					value===d.value
						? 'bg-[var(--color-primary-600)] text-[var(--color-primary-contrast-light)]'
						: 'bg-surface-900 text-surface-200 hover:bg-surface-800',
					i>0 && 'border-l border-surface-700'
				)}
			>
				{d.label}
			</button>
		))}
	</div>
);
export const Center: React.FC<any> = ({ children, className, h }) => (
	<div className={clsx('flex items-center justify-center', className)} style={{ height: h }}>{children}</div>
);
// Simple Table implementation
export const Table: any = ({ children, striped = false }: any) => (
	<div className="overflow-x-auto">
		<table className={clsx('table w-full text-surface-50', striped && 'table-zebra')}>{children}</table>
	</div>
);
Table.Thead = ({ children }: any) => <thead className="bg-surface-800 text-surface-50">{children}</thead>;
Table.Tbody = ({ children }: any) => <tbody>{children}</tbody>;
Table.Tr = ({ children }: any) => <tr className="hover:bg-surface-800/60">{children}</tr>;
Table.Th = ({ children }: any) => <th className="font-semibold text-surface-200">{children}</th>;
Table.Td = ({ children }: any) => <td>{children}</td>;
// Other frequently used Mantine components
export const Image: React.FC<any> = (props) => <img {...props} />;
export const Box: React.FC<any> = ({ children, ...rest }) => <div {...rest}>{children}</div>;
export const Tooltip: React.FC<any> = ({ children }) => <>{children}</>;
export const Collapse: React.FC<any> = ({ in: opened, children }) => (opened ? <>{children}</> : null);
export const Select: React.FC<any> = ({ data = [], value, onChange, placeholder, ...rest }) => (
	<select
		value={value}
		onChange={(e) => onChange?.(e.target.value)}
		{...rest}
		className={clsx('w-full bg-surface-900 text-surface-50 border border-surface-700 rounded-md px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-opacity-40', rest.className)}
	>
		{placeholder && <option value="" disabled hidden>{placeholder}</option>}
		{data.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
	</select>
);
export const SimpleGrid: React.FC<any> = ({ cols=3, children, spacing='1rem' }) => (
	<div style={{ display: 'grid', gap: spacing, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>{children}</div>
);
export const Menu: any = ({ children }: any) => <div className="dropdown">{children}</div>;
Menu.Target = ({ children }: any) => <div tabIndex={0} role="button">{children}</div>;
Menu.Dropdown = ({ children }: any) => <div className="dropdown-content p-2 shadow bg-surface-900 text-surface-50 border border-surface-700 rounded-box">{children}</div>;
Menu.Item = ({ children, leftSection, onClick }: any) => {
	return (
		<button onClick={onClick} className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-surface-800 text-left">
			{leftSection && <span className="text-surface-300">{leftSection}</span>}
			<span className="flex-1">{children}</span>
		</button>
	);
};
export const PaperProps = {} as any;
export const MantineProvider: React.FC<React.PropsWithChildren<{ defaultColorScheme?: 'light'|'dark' }>> = ({ children }) => <>{children}</>;


export const rem = (n: number | string) => (typeof n === 'number' ? `${n}px` : n);
export const Burger: React.FC<{ opened?: boolean; onClick?: () => void; hiddenFrom?: string; size?: string }>
	= ({ onClick }) => <button className="btn btn-ghost btn-sm" onClick={onClick}>☰</button>;
export const AppShell: any = ({ children }: any) => {
	const header: any[] = [];
	const navbar: any[] = [];
	const main: any[] = [];
	React.Children.forEach(children, (child: any) => {
		if (!React.isValidElement(child)) return;
		if (child.type === AppShell.Header) header.push(child);
		else if (child.type === AppShell.Navbar) navbar.push(child);
		else if (child.type === AppShell.Main) main.push(child);
		else main.push(child);
	});
	return (
		<div className="min-h-screen bg-surface-950 text-surface-50 flex flex-col">
			<div className="flex-none">
				{header.length > 0 ? (
					header
				) : (
					<header className="border-b border-surface-700 bg-surface-900 h-14" />
				)}
			</div>
			<div className="flex-1 min-h-0 flex">
				<div className="w-64 flex-none border-r border-surface-700 bg-surface-900 min-h-0 overflow-y-auto">{navbar}</div>
				<div className="flex-1 min-w-0 min-h-0 overflow-auto">{main}</div>
			</div>
		</div>
	);
};
AppShell.Header = ({ children }: any) => <header className="border-b border-surface-700 p-2 bg-surface-900">{children}</header>;
AppShell.Navbar = ({ children }: any) => <aside className="p-2">{children}</aside>;
AppShell.Main = ({ children }: any) => <main className="p-4">{children}</main>;

export default {} as any;

// Minimal TagsInput component
export const TagsInput: React.FC<{
	label?: string;
	placeholder?: string;
	value: string[];
	onChange: (v: string[]) => void;
	splitChars?: string[];
	clearable?: boolean;
	description?: string;
}> = ({ label, placeholder, value, onChange, splitChars = [','], description }) => {
	const [input, setInput] = React.useState('');
	const addTag = (tag: string) => {
		const t = tag.trim();
		if (!t) return;
		if (!value.includes(t)) onChange([...value, t]);
		setInput('');
	};
	const removeTag = (tag: string) => onChange(value.filter((v) => v !== tag));
	const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
		const chars = new Set(splitChars);
		if (e.key === 'Enter' || chars.has(e.key)) {
			e.preventDefault();
			addTag(input);
		}
	};
	return (
		<div className="w-full">
			{label && <div className="label"><span className="label-text">{label}</span></div>}
			<div className="flex flex-wrap gap-2 mb-2">
				{value.map((t) => (
					<span key={t} className="badge badge-outline">
						{t}
						<button type="button" className="ml-2" onClick={() => removeTag(t)}>×</button>
					</span>
				))}
			</div>
			<input
				className="input input-bordered w-full bg-surface-900 text-surface-50 placeholder-surface-400 border-surface-700"
				placeholder={placeholder}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={onKeyDown}
			/>
			{description && <div className="text-xs text-surface-400 mt-1">{description}</div>}
		</div>
	);
};

// Minimal FileInput component
export const FileInput: React.FC<{
	label?: string;
	placeholder?: string;
	accept?: string;
	leftSection?: React.ReactNode;
	onChange?: (file: File | null) => void;
}> = ({ label, accept, onChange }) => {
	const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		const f = e.target.files?.[0] ?? null;
		onChange?.(f);
	};
	return (
		<label className="form-control w-full">
			{label && <div className="label"><span className="label-text">{label}</span></div>}
			<input type="file" accept={accept} onChange={handleChange} className="file-input file-input-bordered w-full bg-surface-900 text-surface-50 border-surface-700" />
		</label>
	);
};
