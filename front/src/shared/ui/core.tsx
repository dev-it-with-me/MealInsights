// UI core built with Skeleton/Tailwind primitives
import React from "react";
import ReactDOM from "react-dom";
import { clsx } from "clsx";
// Extracted building blocks
export { Container } from "./components/Container";
export { Stack } from "./components/Stack";
export { Group } from "./components/Group";
import { resolveColorVars } from "./components/ColorSystem";

export const Title: React.FC<any> = ({
  order = 2,
  className,
  children,
  c,
  mb,
}) => {
  const sizeClass =
    order === 1
      ? "text-3xl"
      : order === 2
      ? "text-2xl"
      : order === 3
      ? "text-xl"
      : "text-lg";
  const cls = clsx(
    "font-bold",
    sizeClass,
    c === "dimmed" && "text-surface-400",
    mb && `mb-${mb}`,
    className
  );
  if (order === 1) return <h1 className={cls}>{children}</h1>;
  if (order === 2) return <h2 className={cls}>{children}</h2>;
  if (order === 3) return <h3 className={cls}>{children}</h3>;
  if (order === 4) return <h4 className={cls}>{children}</h4>;
  if (order === 5) return <h5 className={cls}>{children}</h5>;
  return <h6 className={cls}>{children}</h6>;
};

export const Text: React.FC<any> = ({
  size = "md",
  c,
  color,
  ta,
  fw,
  className,
  children,
  mb,
  mt,
  opacity,
  tt,
  p,
  style,
  ...rest
}) => (
  <span
    {...rest}
    style={{ opacity, padding: p, textAlign: ta, ...style }}
    className={clsx(
      size === "xs"
        ? "text-xs"
        : size === "sm"
        ? "text-sm"
        : size === "lg"
        ? "text-lg"
        : "text-base",
      (c === "dimmed" || color === "dimmed") && "text-surface-400",
      fw && `font-[${fw}]`,
      tt === "uppercase" && "uppercase",
      mb && `mb-${mb}`,
      mt && `mt-${mt}`,
      className
    )}
  >
    {children}
  </span>
);

export const Paper: React.FC<any> = ({
  withBorder,
  p = "md",
  shadow = "sm",
  className,
  children,
  mb,
  h,
  style,
  bg,
  ...rest
}) => (
  <div
    {...rest}
    style={{ height: h, backgroundColor: bg, ...style }}
    className={clsx(
      "rounded-xl bg-gradient-to-br from-surface-900/90 to-surface-800/90 text-surface-50 backdrop-blur-sm border border-surface-700/50 transition-all duration-200 hover:border-surface-600/60",
      withBorder &&
        "border-2 border-surface-600/70 shadow-lg shadow-surface-900/30",
      p === 0
        ? "p-0"
        : p === "xs"
        ? "p-2"
        : p === "sm"
        ? "p-3"
        : p === "md"
        ? "p-5"
        : p === "lg"
        ? "p-7"
        : typeof p === "number"
        ? `p-[${p}px]`
        : `p-${p}`,
      shadow === "sm" && "shadow-md shadow-surface-900/20",
      shadow === "md" && "shadow-lg shadow-surface-900/30",
      shadow === "lg" && "shadow-xl shadow-surface-900/40",
      mb && `mb-${mb}`,
      className
    )}
  >
    {children}
  </div>
);

export const Badge: React.FC<any> = ({
  size = "sm",
  variant = "light",
  color = "primary",
  className,
  children,
}) => {
  const sizeCls =
    size === "xs"
      ? "text-[10px] px-2.5 py-1"
      : size === "lg"
      ? "text-sm px-4 py-2"
      : "text-xs px-3 py-1.5";
  const vars = resolveColorVars(color);
  const baseCls =
    "inline-flex items-center rounded-full font-semibold transition-all duration-200 ease-out";
  let styles =
    "border border-surface-600/50 bg-gradient-to-r from-surface-800/80 to-surface-700/80 text-surface-100 shadow-md shadow-surface-900/30 hover:shadow-lg hover:shadow-surface-900/40";
  if (variant === "outline")
    styles = `border-2 border-[var(${vars.base})]/70 text-[var(${vars.base})] bg-transparent backdrop-blur-sm hover:bg-[var(${vars.base})]/10 hover:border-[var(${vars.base})] hover:shadow-md hover:shadow-[var(${vars.base})]/20`;
  if (variant === "filled")
    styles = `border-0 bg-gradient-to-r from-[var(${vars.strong})] to-[var(${vars.base})] text-[var(${vars.contrast})] shadow-md shadow-[var(${vars.base})]/20 hover:shadow-lg hover:shadow-[var(${vars.base})]/30`;
  if (variant === "dot")
    styles =
      "border border-surface-600/50 bg-gradient-to-r from-surface-900/90 to-surface-800/90 text-surface-100 relative pl-6 shadow-md shadow-surface-900/30";
  return (
    <span className={clsx(baseCls, sizeCls, styles, className)}>
      {variant === "dot" && (
        <span
          className="absolute left-2.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full shadow-sm"
          style={{
            backgroundColor: `var(${vars.base})`,
            boxShadow: `0 0 4px var(${vars.base})`,
          }}
        />
      )}
      {children}
    </span>
  );
};

export type ButtonProps = any;
export const Button: React.FC<any> = ({
  leftsection,
  variant = "filled",
  size = "md",
  loading,
  className,
  children,
  fullWidth,
  color = "primary",
  disabled,
  ...rest
}) => {
  const sizeCls =
    size === "xs"
      ? "text-xs px-3 py-1.5"
      : size === "sm"
      ? "text-sm px-4 py-2"
      : size === "lg"
      ? "text-base px-6 py-3"
      : "text-sm px-5 py-2.5";
  const filledMap: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-500)] text-white border-0 shadow-lg shadow-[var(--color-primary-500)]/20 hover:from-[var(--color-primary-500)] hover:to-[var(--color-primary-400)] hover:shadow-xl hover:shadow-[var(--color-primary-500)]/30 active:scale-95",
    secondary:
      "bg-gradient-to-r from-[var(--color-secondary-600)] to-[var(--color-secondary-500)] text-[var(--color-secondary-contrast-light)] border-0 shadow-lg shadow-[var(--color-secondary-500)]/20 hover:from-[var(--color-secondary-500)] hover:to-[var(--color-secondary-400)] hover:shadow-xl hover:shadow-[var(--color-secondary-500)]/30 active:scale-95",
    tertiary:
      "bg-gradient-to-r from-[var(--color-tertiary-600)] to-[var(--color-tertiary-500)] text-[var(--color-tertiary-contrast-light)] border-0 shadow-lg shadow-[var(--color-tertiary-500)]/20 hover:from-[var(--color-tertiary-500)] hover:to-[var(--color-tertiary-400)] hover:shadow-xl hover:shadow-[var(--color-tertiary-500)]/30 active:scale-95",
    success:
      "bg-gradient-to-r from-[var(--color-success-600)] to-[var(--color-success-500)] text-[var(--color-success-contrast-light)] border-0 shadow-lg shadow-[var(--color-success-500)]/20 hover:from-[var(--color-success-500)] hover:to-[var(--color-success-400)] hover:shadow-xl hover:shadow-[var(--color-success-500)]/30 active:scale-95",
    green:
      "bg-gradient-to-r from-[var(--color-success-600)] to-[var(--color-success-500)] text-[var(--color-success-contrast-light)] border-0 shadow-lg shadow-[var(--color-success-500)]/20 hover:from-[var(--color-success-500)] hover:to-[var(--color-success-400)] hover:shadow-xl hover:shadow-[var(--color-success-500)]/30 active:scale-95",
    error:
      "bg-gradient-to-r from-[var(--color-error-600)] to-[var(--color-error-500)] text-[var(--color-error-contrast-light)] border-0 shadow-lg shadow-[var(--color-error-500)]/20 hover:from-[var(--color-error-500)] hover:to-[var(--color-error-400)] hover:shadow-xl hover:shadow-[var(--color-error-500)]/30 active:scale-95",
    red: "bg-gradient-to-r from-[var(--color-error-600)] to-[var(--color-error-500)] text-[var(--color-error-contrast-light)] border-0 shadow-lg shadow-[var(--color-error-500)]/20 hover:from-[var(--color-error-500)] hover:to-[var(--color-error-400)] hover:shadow-xl hover:shadow-[var(--color-error-500)]/30 active:scale-95",
    warning:
      "bg-gradient-to-r from-[var(--color-warning-600)] to-[var(--color-warning-500)] text-[var(--color-warning-contrast-light)] border-0 shadow-lg shadow-[var(--color-warning-500)]/20 hover:from-[var(--color-warning-500)] hover:to-[var(--color-warning-400)] hover:shadow-xl hover:shadow-[var(--color-warning-500)]/30 active:scale-95",
    yellow:
      "bg-gradient-to-r from-[var(--color-warning-600)] to-[var(--color-warning-500)] text-[var(--color-warning-contrast-light)] border-0 shadow-lg shadow-[var(--color-warning-500)]/20 hover:from-[var(--color-warning-500)] hover:to-[var(--color-warning-400)] hover:shadow-xl hover:shadow-[var(--color-warning-500)]/30 active:scale-95",
    neutral:
      "bg-gradient-to-r from-surface-700 to-surface-600 text-surface-50 border-0 shadow-lg shadow-surface-900/50 hover:from-surface-600 hover:to-surface-500 hover:shadow-xl hover:shadow-surface-900/60 active:scale-95",
    gray: "bg-gradient-to-r from-surface-700 to-surface-600 text-surface-50 border-0 shadow-lg shadow-surface-900/50 hover:from-surface-600 hover:to-surface-500 hover:shadow-xl hover:shadow-surface-900/60 active:scale-95",
  };
  const outlineMap: Record<string, string> = {
    primary:
      "bg-transparent text-white border-[var(--color-primary-500)] border-2 backdrop-blur-sm hover:bg-[var(--color-primary-500)]/10 hover:text-[var(--color-primary-300)] hover:border-[var(--color-primary-400)] hover:shadow-lg hover:shadow-[var(--color-primary-500)]/20 active:scale-95",
    secondary:
      "bg-transparent text-[var(--color-secondary-400)] border-[var(--color-secondary-500)] border-2 backdrop-blur-sm hover:bg-[var(--color-secondary-500)]/10 hover:text-[var(--color-secondary-300)] hover:border-[var(--color-secondary-400)] hover:shadow-lg hover:shadow-[var(--color-secondary-500)]/20 active:scale-95",
    tertiary:
      "bg-transparent text-[var(--color-tertiary-400)] border-[var(--color-tertiary-500)] border-2 backdrop-blur-sm hover:bg-[var(--color-tertiary-500)]/10 hover:text-[var(--color-tertiary-300)] hover:border-[var(--color-tertiary-400)] hover:shadow-lg hover:shadow-[var(--color-tertiary-500)]/20 active:scale-95",
    success:
      "bg-transparent text-[var(--color-success-400)] border-[var(--color-success-500)] border-2 backdrop-blur-sm hover:bg-[var(--color-success-500)]/10 hover:text-[var(--color-success-300)] hover:border-[var(--color-success-400)] hover:shadow-lg hover:shadow-[var(--color-success-500)]/20 active:scale-95",
    green:
      "bg-transparent text-[var(--color-success-400)] border-[var(--color-success-500)] border-2 backdrop-blur-sm hover:bg-[var(--color-success-500)]/10 hover:text-[var(--color-success-300)] hover:border-[var(--color-success-400)] hover:shadow-lg hover:shadow-[var(--color-success-500)]/20 active:scale-95",
    error:
      "bg-transparent text-[var(--color-error-400)] border-[var(--color-error-500)] border-2 backdrop-blur-sm hover:bg-[var(--color-error-500)]/10 hover:text-[var(--color-error-300)] hover:border-[var(--color-error-400)] hover:shadow-lg hover:shadow-[var(--color-error-500)]/20 active:scale-95",
    red: "bg-transparent text-[var(--color-error-400)] border-[var(--color-error-500)] border-2 backdrop-blur-sm hover:bg-[var(--color-error-500)]/10 hover:text-[var(--color-error-300)] hover:border-[var(--color-error-400)] hover:shadow-lg hover:shadow-[var(--color-error-500)]/20 active:scale-95",
    warning:
      "bg-transparent text-[var(--color-warning-400)] border-[var(--color-warning-500)] border-2 backdrop-blur-sm hover:bg-[var(--color-warning-500)]/10 hover:text-[var(--color-warning-300)] hover:border-[var(--color-warning-400)] hover:shadow-lg hover:shadow-[var(--color-warning-500)]/20 active:scale-95",
    yellow:
      "bg-transparent text-[var(--color-warning-400)] border-[var(--color-warning-500)] border-2 backdrop-blur-sm hover:bg-[var(--color-warning-500)]/10 hover:text-[var(--color-warning-300)] hover:border-[var(--color-warning-400)] hover:shadow-lg hover:shadow-[var(--color-warning-500)]/20 active:scale-95",
    neutral:
      "bg-transparent text-surface-300 border-surface-500 border-2 backdrop-blur-sm hover:bg-surface-700/20 hover:text-surface-200 hover:border-surface-400 hover:shadow-lg hover:shadow-surface-900/30 active:scale-95",
    gray: "bg-transparent text-surface-300 border-surface-500 border-2 backdrop-blur-sm hover:bg-surface-700/20 hover:text-surface-200 hover:border-surface-400 hover:shadow-lg hover:shadow-surface-900/30 active:scale-95",
  };
  const baseCls =
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)] focus-visible:ring-opacity-60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950";
  const variantCls =
    variant === "outline"
      ? outlineMap[color] || outlineMap.primary
      : variant === "light" || variant === "subtle"
      ? "bg-surface-800/60 text-surface-100 border border-surface-600/50 backdrop-blur-sm hover:bg-surface-700/80 hover:border-surface-500/60 hover:shadow-md active:scale-95"
      : filledMap[color] || filledMap.primary;
  return (
    <button
      {...rest}
      disabled={disabled}
      className={clsx(
        baseCls,
        sizeCls,
        variantCls,
        fullWidth && "w-full",
        disabled &&
          "opacity-50 cursor-not-allowed pointer-events-none transform-none shadow-none",
        className
      )}
    >
      {leftsection && (
        <span className="mr-1.5 inline-flex items-center">{leftsection}</span>
      )}
      {loading && <span className="loading loading-spinner mr-1.5"></span>}
      {children}
    </button>
  );
};

export const Modal: React.FC<any> = ({
  opened,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) => {
  React.useEffect(() => {
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened, onClose]);
  if (!opened) return null;
  const sizeCls =
    size === "xs"
      ? "max-w-sm"
      : size === "sm"
      ? "max-w-md"
      : size === "lg"
      ? "max-w-3xl"
      : size === "xl"
      ? "max-w-5xl"
      : "max-w-lg"; // default 'md'
  const node = (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/70 to-black/80 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          "relative mx-4 w-full rounded-2xl border border-surface-600/50 bg-gradient-to-br from-surface-900/95 to-surface-800/95 text-surface-50 shadow-2xl shadow-surface-900/50 backdrop-blur-lg animate-in zoom-in-95 duration-200 flex flex-col",
          sizeCls
        )}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh" }}
      >
        {title && (
          <div className="flex-none px-6 pt-6 pb-4">
            <div className="font-bold text-xl text-surface-50 border-b border-surface-700/50 pb-3">
              {title}
            </div>
          </div>
        )}
        <div className="flex-1 min-h-0 px-6 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-600 scrollbar-track-surface-800">
          {children}
        </div>
        {footer && (
          <div className="flex-none px-6 py-4 border-t border-surface-700/50 bg-gradient-to-r from-surface-900/60 to-surface-800/60 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
  return ReactDOM.createPortal(node, document.body);
};

export const TextInput: React.FC<any> = ({
  label,
  error,
  description,
  className,
  compact,
  ...props
}) => (
  <div className={clsx("w-full", compact ? "mb-1" : "mb-2")}>
    {label && (
      <label
        className={clsx(
          "block text-sm font-medium text-surface-200",
          compact ? "mb-0.5" : "mb-1"
        )}
      >
        {label}
      </label>
    )}
    <input
      type="text"
      {...props}
      className={clsx(
        "input input-bordered w-full bg-gradient-to-br from-surface-900/90 to-surface-800/90 text-surface-50 placeholder-surface-400 border border-surface-600/50 rounded-lg backdrop-blur-sm transition-all duration-200 focus:outline-none focus:border-[var(--color-primary-500)]/70 focus:shadow-lg focus:shadow-[var(--color-primary-500)]/20 focus:bg-surface-800/95 hover:border-surface-500/60",
        compact && "text-sm py-1.5",
        error &&
          "border-[var(--color-error-500)] focus:border-[var(--color-error-500)]",
        className
      )}
    />
    {description && (
      <div
        className={clsx(
          "text-xs text-surface-400",
          compact ? "mt-0.5" : "mt-1"
        )}
      >
        {description}
      </div>
    )}
    {error && (
      <div
        className={clsx(
          "text-xs text-[var(--color-error-500)] font-medium",
          compact ? "mt-0.5" : "mt-1"
        )}
      >
        {error}
      </div>
    )}
  </div>
);

export const Textarea: React.FC<any> = ({
  label,
  error,
  description,
  className,
  compact,
  rows = 3,
  ...props
}) => (
  <div className={clsx("w-full", compact ? "mb-1" : "mb-2")}>
    {label && (
      <label
        className={clsx(
          "block text-sm font-medium text-surface-200",
          compact ? "mb-0.5" : "mb-1"
        )}
      >
        {label}
      </label>
    )}
    <textarea
      rows={rows}
      {...props}
      className={clsx(
        "textarea textarea-bordered w-full bg-gradient-to-br from-surface-900/90 to-surface-800/90 text-surface-50 placeholder-surface-400 border border-surface-600/50 rounded-lg backdrop-blur-sm transition-all duration-200 focus:outline-none focus:border-[var(--color-primary-500)]/70 focus:shadow-lg focus:shadow-[var(--color-primary-500)]/20 focus:bg-surface-800/95 hover:border-surface-500/60 resize-none",
        compact && "text-sm py-1.5",
        error &&
          "border-[var(--color-error-500)] focus:border-[var(--color-error-500)]",
        className
      )}
    />
    {description && (
      <div
        className={clsx(
          "text-xs text-surface-400",
          compact ? "mt-0.5" : "mt-1"
        )}
      >
        {description}
      </div>
    )}
    {error && (
      <div
        className={clsx(
          "text-xs text-[var(--color-error-500)] font-medium",
          compact ? "mt-0.5" : "mt-1"
        )}
      >
        {error}
      </div>
    )}
  </div>
);
export const NumberInput: React.FC<any> = ({
  label,
  error,
  description,
  className,
  compact,
  onChange,
  value,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (onChange) {
      // Convert string to number, or pass empty string for clearing
      if (inputValue === "") {
        onChange("");
      } else {
        const numValue = parseFloat(inputValue);
        onChange(isNaN(numValue) ? "" : numValue);
      }
    }
  };

  return (
    <div className={clsx("w-full", compact ? "mb-1" : "mb-2")}>
      {label && (
        <label
          className={clsx(
            "block text-sm font-medium text-surface-200",
            compact ? "mb-0.5" : "mb-1"
          )}
        >
          {label}
        </label>
      )}
      <input
        type="number"
        {...props}
        value={value ?? ""}
        onChange={handleChange}
        className={clsx(
          "input input-bordered w-full bg-gradient-to-br from-surface-900/90 to-surface-800/90 text-surface-50 placeholder-surface-400 border border-surface-600/50 rounded-lg backdrop-blur-sm transition-all duration-200 focus:outline-none focus:border-[var(--color-primary-500)]/70 focus:shadow-lg focus:shadow-[var(--color-primary-500)]/20 focus:bg-surface-800/95 hover:border-surface-500/60",
          compact && "text-sm py-1.5",
          error &&
            "border-[var(--color-error-500)] focus:border-[var(--color-error-500)]",
          className
        )}
      />
      {description && (
        <div
          className={clsx(
            "text-xs text-surface-400",
            compact ? "mt-0.5" : "mt-1"
          )}
        >
          {description}
        </div>
      )}
      {error && (
        <div
          className={clsx(
            "text-xs text-[var(--color-error-500)] font-medium",
            compact ? "mt-0.5" : "mt-1"
          )}
        >
          {error}
        </div>
      )}
    </div>
  );
};

// Compact Nutrition Grid Component for forms
export const NutritionGrid: React.FC<{
  children: React.ReactNode;
  title?: string;
}> = ({ children, title }) => (
  <div className="w-full">
    {title && (
      <h3 className="text-sm font-semibold text-surface-200 mb-3">{title}</h3>
    )}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 rounded-xl bg-gradient-to-br from-surface-900/60 to-surface-800/60 border border-surface-600/30 backdrop-blur-sm">
      {children}
    </div>
  </div>
);

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
  const [query, setQuery] = React.useState("");
  const values: string[] = Array.isArray(value) ? value : [];
  const filtered = Array.isArray(data)
    ? data.filter((d: any) =>
        String(d.label ?? d.value ?? "")
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
    <div className={clsx("w-full", className)} {...rest}>
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-surface-200">{label}</span>
          {clearable && values.length > 0 && (
            <button
              type="button"
              className="text-xs text-surface-400 hover:text-surface-200 transition-colors duration-150 font-medium"
              onClick={clear}
              disabled={disabled}
            >
              Clear
            </button>
          )}
        </div>
      )}
      {searchable && (
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Search..."}
          disabled={disabled}
          className="input input-bordered w-full mb-3 bg-gradient-to-br from-surface-900/90 to-surface-800/90 text-surface-50 placeholder-surface-400 border border-surface-600/50 rounded-lg backdrop-blur-sm transition-all duration-200 focus:outline-none focus:border-[var(--color-primary-500)]/70 focus:shadow-lg focus:shadow-[var(--color-primary-500)]/20"
        />
      )}
      {!searchable && placeholder && values.length === 0 && (
        <div className="text-xs text-surface-400 mb-3 font-medium">
          {placeholder}
        </div>
      )}
      <div
        className={clsx(
          "rounded-xl border border-surface-600/50 bg-gradient-to-br from-surface-900/90 to-surface-800/90 p-3 backdrop-blur-sm shadow-md shadow-surface-900/20",
          disabled && "opacity-60 pointer-events-none"
        )}
      >
        {filtered.length === 0 ? (
          <div className="text-xs text-surface-400 p-3 text-center font-medium">
            No options
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-auto scrollbar-thin scrollbar-thumb-surface-600 scrollbar-track-surface-800">
            {filtered.map((o: any) => {
              const selected = values.includes(o.value);
              return (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => toggle(o.value)}
                  aria-pressed={selected}
                  className={clsx(
                    "w-full text-left px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/40 focus:ring-offset-2 focus:ring-offset-surface-900",
                    selected
                      ? "border-2 border-[var(--color-primary-500)]/70 bg-gradient-to-r from-[var(--color-primary-600)]/20 to-[var(--color-primary-500)]/20 shadow-md shadow-[var(--color-primary-500)]/20 text-[var(--color-primary-300)]"
                      : "border border-surface-700/50 bg-gradient-to-br from-surface-800/60 to-surface-700/60 hover:bg-gradient-to-br hover:from-surface-700/80 hover:to-surface-600/80 hover:border-surface-600/60 hover:shadow-md text-surface-200 hover:text-surface-100"
                  )}
                >
                  <span className="text-sm">{o.label}</span>
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
export const Divider: React.FC<any> = ({ label, my }) => (
  <div className={clsx("divider", my && `my-${my}`)}>{label}</div>
);
export const ScrollArea: any = {
  Autosize: ({ children }: any) => (
    <div className="max-h-[70vh] overflow-auto">{children}</div>
  ),
};
export const Grid: any = ({ children }: any) => (
  <div className="grid grid-cols-12 gap-4">{children}</div>
);
Grid.Col = ({ span, children }: any) => {
  const spanClass =
    typeof span === "number" ? `col-span-${span}` : "col-span-12";
  return <div className={spanClass}>{children}</div>;
};
export const Card: React.FC<any> = ({
  children,
  className,
  withBorder,
  p = "md",
  ...rest
}) => (
  <div
    {...rest}
    className={clsx(
      "rounded-xl bg-gradient-to-br from-surface-900/90 to-surface-800/90 text-surface-50 border border-surface-600/50 backdrop-blur-sm transition-all duration-200 hover:border-surface-500/60 hover:shadow-lg hover:shadow-surface-900/30",
      withBorder &&
        "border-2 border-surface-600/70 shadow-lg shadow-surface-900/20",
      p === "sm" ? "p-3" : p === "md" ? "p-5" : "p-7",
      className
    )}
  >
    {children}
  </div>
);
// Add Card.Section for compatibility
// @ts-expect-error augmenting function component
Card.Section = ({ children }: any) => <div className="p-0">{children}</div>;
export const ActionIcon: React.FC<
  React.PropsWithChildren<{
    onClick?: () => void;
    color?: string;
    variant?: string;
    size?: "xs" | "sm" | "md";
    disabled?: boolean;
    loading?: boolean;
  }>
> = ({ children, onClick, disabled, loading, size = "sm" }) => {
  const sizeCls =
    size === "xs" ? "h-8 w-8" : size === "md" ? "h-11 w-11" : "h-9 w-9";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg border border-surface-600/50 bg-gradient-to-br from-surface-800/80 to-surface-700/80 hover:from-surface-700/90 hover:to-surface-600/90 text-surface-50 transition-all duration-200 ease-out backdrop-blur-sm hover:border-surface-500/60 hover:shadow-md hover:shadow-surface-900/30 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/40 focus:ring-offset-2 focus:ring-offset-surface-950",
        sizeCls,
        disabled &&
          "opacity-50 cursor-not-allowed pointer-events-none transform-none shadow-none"
      )}
    >
      {loading && <span className="loading loading-spinner mr-1"></span>}
      {children}
    </button>
  );
};
export const Alert: React.FC<any> = ({
  title,
  children,
  icon,
  color = "blue",
  m,
}) => {
  const colorVar =
    color === "red"
      ? "--color-error-500"
      : color === "green"
      ? "--color-success-500"
      : color === "yellow"
      ? "--color-warning-500"
      : "--color-primary-500";
  const bgVar =
    color === "red"
      ? "--color-error-900"
      : color === "green"
      ? "--color-success-900"
      : color === "yellow"
      ? "--color-warning-900"
      : "--color-primary-900";
  return (
    <div
      className={clsx(
        "rounded-xl border-2 p-4 flex gap-3 items-start backdrop-blur-sm transition-all duration-200 shadow-lg hover:shadow-xl",
        m && `m-${m}`
      )}
      style={{
        borderColor: `var(${colorVar})/70`,
        backgroundColor: `var(${bgVar})/20`,
        boxShadow: `0 4px 12px var(${colorVar})/10, 0 2px 4px var(${colorVar})/5`,
      }}
    >
      {icon && <div className="mt-0.5 text-surface-100 opacity-90">{icon}</div>}
      <div className="flex-1">
        {title && <div className="font-bold text-surface-50 mb-1">{title}</div>}
        <div className="text-surface-200 leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
export const Loader: React.FC<{ size?: any }> = () => (
  <span className="loading loading-spinner" />
);
export const SegmentedControl: React.FC<any> = ({ data, value, onChange }) => (
  <div className="inline-flex rounded-xl border border-surface-600/50 overflow-hidden bg-gradient-to-r from-surface-900/90 to-surface-800/90 backdrop-blur-sm shadow-md shadow-surface-900/20">
    {data?.map((d: any, i: number) => (
      <button
        key={d.value}
        onClick={() => onChange(d.value)}
        className={clsx(
          "px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-out relative",
          value === d.value
            ? "bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-500)] text-[var(--color-primary-contrast-light)] shadow-lg shadow-[var(--color-tertiary-500)]/20 z-10"
            : "bg-transparent text-surface-200 hover:text-surface-100 hover:bg-surface-700/50",
          i > 0 && "border-l border-surface-700/50"
        )}
      >
        {d.label}
      </button>
    ))}
  </div>
);
export const Center: React.FC<any> = ({ children, className, h }) => (
  <div
    className={clsx("flex items-center justify-center", className)}
    style={{ height: h }}
  >
    {children}
  </div>
);
// Simple Table implementation
export const Table: any = ({ children, striped = false }: any) => (
  <div className="overflow-x-auto">
    <table
      className={clsx("table w-full text-surface-50", striped && "table-zebra")}
    >
      {children}
    </table>
  </div>
);
Table.Thead = ({ children }: any) => (
  <thead className="bg-surface-800 text-surface-50">{children}</thead>
);
Table.Tbody = ({ children }: any) => <tbody>{children}</tbody>;
Table.Tr = ({ children }: any) => (
  <tr className="hover:bg-surface-800/60">{children}</tr>
);
Table.Th = ({ children }: any) => (
  <th className="font-semibold text-surface-200">{children}</th>
);
Table.Td = ({ children }: any) => <td>{children}</td>;
// Other frequently used Mantine components
export const Image: React.FC<any> = (props) => <img {...props} />;
export const Box: React.FC<any> = ({ children, ...rest }) => (
  <div {...rest}>{children}</div>
);
export const Tooltip: React.FC<any> = ({ children }) => <>{children}</>;
export const Collapse: React.FC<any> = ({ in: opened, children }) =>
  opened ? <>{children}</> : null;
export const Select: React.FC<any> = ({
  data = [],
  value,
  onChange,
  placeholder,
  ...rest
}) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    {...rest}
    className={clsx(
      "w-full bg-gradient-to-br from-surface-900/90 to-surface-800/90 text-surface-50 border border-surface-600/50 rounded-lg px-4 py-2.5 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:border-[var(--color-primary-500)]/70 focus:shadow-lg focus:shadow-[var(--color-primary-500)]/20 hover:border-surface-500/60",
      rest.className
    )}
  >
    {placeholder && (
      <option value="" disabled hidden>
        {placeholder}
      </option>
    )}
    {data.map((o: any) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);
export const SimpleGrid: React.FC<any> = ({
  cols = 3,
  children,
  spacing = "1rem",
}) => (
  <div
    style={{
      display: "grid",
      gap: spacing,
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    }}
  >
    {children}
  </div>
);
export const Menu: any = ({ children }: any) => (
  <div className="dropdown">{children}</div>
);
Menu.Target = ({ children }: any) => (
  <div tabIndex={0} role="button">
    {children}
  </div>
);
Menu.Dropdown = ({ children }: any) => (
  <div className="dropdown-content p-3 shadow-xl bg-gradient-to-br from-surface-900/95 to-surface-800/95 text-surface-50 border border-surface-600/50 rounded-xl backdrop-blur-lg">
    {children}
  </div>
);
Menu.Item = ({ children, leftsection, onClick }: any) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-surface-700/60 hover:to-surface-600/60 text-left transition-all duration-200 ease-out group"
    >
      {leftsection && (
        <span className="text-surface-300 group-hover:text-surface-200 transition-colors duration-200">
          {leftsection}
        </span>
      )}
      <span className="flex-1 font-medium group-hover:text-surface-100 transition-colors duration-200">
        {children}
      </span>
    </button>
  );
};
export const PaperProps = {} as any;
export const MantineProvider: React.FC<
  React.PropsWithChildren<{ defaultColorScheme?: "light" | "dark" }>
> = ({ children }) => <>{children}</>;

export const rem = (n: number | string) =>
  typeof n === "number" ? `${n}px` : n;
export const Burger: React.FC<{
  opened?: boolean;
  onClick?: () => void;
  hiddenFrom?: string;
  size?: string;
}> = ({ onClick }) => (
  <button className="btn btn-ghost btn-sm" onClick={onClick}>
    ☰
  </button>
);
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
        <div className="w-64 flex-none border-r border-surface-700 bg-surface-900 min-h-0 overflow-y-auto">
          {navbar}
        </div>
        <div className="flex-1 min-w-0 min-h-0 overflow-auto">{main}</div>
      </div>
    </div>
  );
};
AppShell.Header = ({ children }: any) => (
  <header className="border-b border-surface-700 p-2 bg-surface-900">
    {children}
  </header>
);
AppShell.Navbar = ({ children }: any) => (
  <aside className="p-2">{children}</aside>
);
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
}> = ({
  label,
  placeholder,
  value,
  onChange,
  splitChars = [","],
  description,
}) => {
  const [input, setInput] = React.useState("");
  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setInput("");
  };
  const removeTag = (tag: string) => onChange(value.filter((v) => v !== tag));
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const chars = new Set(splitChars);
    if (e.key === "Enter" || chars.has(e.key)) {
      e.preventDefault();
      addTag(input);
    }
  };
  return (
    <div className="w-full">
      {label && (
        <div className="label">
          <span className="label-text font-medium text-surface-200">
            {label}
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-3">
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--color-primary-600)]/20 to-[var(--color-primary-500)]/20 border border-[var(--color-primary-500)]/50 text-[var(--color-primary-300)] text-sm font-medium backdrop-blur-sm transition-all duration-200 hover:border-[var(--color-primary-400)]/60"
          >
            {t}
            <button
              type="button"
              className="ml-1 text-[var(--color-primary-400)] hover:text-[var(--color-primary-300)] transition-colors duration-150"
              onClick={() => removeTag(t)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        className="input input-bordered w-full bg-gradient-to-br from-surface-900/90 to-surface-800/90 text-surface-50 placeholder-surface-400 border border-surface-600/50 rounded-lg backdrop-blur-sm transition-all duration-200 focus:outline-none focus:border-[var(--color-primary-500)]/70 focus:shadow-lg focus:shadow-[var(--color-primary-500)]/20"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {description && (
        <div className="text-xs text-surface-400 mt-2 font-medium">
          {description}
        </div>
      )}
    </div>
  );
};

// Minimal FileInput component
export const FileInput: React.FC<{
  label?: string;
  placeholder?: string;
  accept?: string;
  leftsection?: React.ReactNode;
  onChange?: (file: File | null) => void;
}> = ({ label, accept, onChange }) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    onChange?.(f);
  };
  return (
    <label className="form-control w-full">
      {label && (
        <div className="label">
          <span className="label-text font-medium text-surface-200">
            {label}
          </span>
        </div>
      )}
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="file-input file-input-bordered w-full bg-gradient-to-br from-surface-900/90 to-surface-800/90 text-surface-50 border border-surface-600/50 rounded-lg backdrop-blur-sm transition-all duration-200 hover:border-surface-500/60 focus:border-[var(--color-primary-500)]/70 focus:shadow-lg focus:shadow-[var(--color-primary-500)]/20"
      />
    </label>
  );
};
