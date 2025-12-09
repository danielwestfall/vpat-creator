import React from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Label from '@radix-ui/react-label';
import './Checkbox.css';

export interface CheckboxProps {
  label?: string;
  helperText?: string;
  error?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  value?: string;
  className?: string;
}

export const CheckboxComponent = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      error,
      checked,
      defaultChecked,
      onCheckedChange,
      required,
      disabled,
      id,
      name,
      value,
      className = '',
    },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;
    const helperTextId = helperText ? `${checkboxId}-helper` : undefined;
    const errorId = error ? `${checkboxId}-error` : undefined;

    const hasError = Boolean(error);

    const wrapperClasses = ['checkbox-wrapper', className].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        <div className="checkbox-container">
          <Checkbox.Root
            ref={ref}
            id={checkboxId}
            className={`checkbox-root ${hasError ? 'checkbox-root--error' : ''}`}
            checked={checked}
            defaultChecked={defaultChecked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            required={required}
            name={name}
            value={value}
            aria-invalid={hasError}
            aria-describedby={[helperTextId, errorId].filter(Boolean).join(' ') || undefined}
          >
            <Checkbox.Indicator className="checkbox-indicator">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.5 3.5L6 9L3.5 6.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Checkbox.Indicator>
          </Checkbox.Root>
          {label && (
            <Label.Root htmlFor={checkboxId} className="checkbox-label">
              {label}
              {required && (
                <span className="checkbox-label__required" aria-label="required">
                  *
                </span>
              )}
            </Label.Root>
          )}
        </div>
        {helperText && !error && (
          <span id={helperTextId} className="checkbox-helper-text">
            {helperText}
          </span>
        )}
        {error && (
          <span id={errorId} className="checkbox-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

CheckboxComponent.displayName = 'Checkbox';
