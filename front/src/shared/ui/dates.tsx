import React from "react";

export type DateValue = Date | null;

export const DatePickerInput: React.FC<{
  label?: string;
  placeholder?: string;
  value?: DateValue;
  onChange?: (d: DateValue) => void;
  leftsection?: React.ReactNode;
  clearable?: boolean;
  size?: string;
  minDate?: Date;
}> = ({ label, value, onChange }) => (
  <label className="form-control w-full">
    {label && (
      <div className="label">
        <span className="label-text">{label}</span>
      </div>
    )}
    <input
      type="date"
      value={value ? new Date(value).toISOString().slice(0, 10) : ""}
      onChange={(e) =>
        onChange?.(e.target.value ? new Date(e.target.value) : null)
      }
      className="input input-bordered w-full bg-surface-900 text-surface-50 placeholder-surface-400 border-surface-700"
    />
  </label>
);

export const TimeInput: React.FC<{
  label?: string;
  value?: string;
  onChange?: (e: any) => void;
}> = ({ label, value, onChange }) => (
  <label className="form-control w-full">
    {label && (
      <div className="label">
        <span className="label-text">{label}</span>
      </div>
    )}
    <input
      type="time"
      value={value}
      onChange={onChange}
      className="input input-bordered w-full bg-surface-900 text-surface-50 placeholder-surface-400 border-surface-700"
    />
  </label>
);

export default {} as any;
