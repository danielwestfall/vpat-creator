import React from 'react';
import * as Label from '@radix-ui/react-label';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      startIcon,
      endIcon,
      className = '',
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const hasError = Boolean(error);

    const wrapperClasses = [
      'input-wrapper',
      fullWidth && 'input-wrapper--full-width',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [
      'input',
      hasError && 'input--error',
      startIcon && 'input--with-start-icon',
      endIcon && 'input--with-end-icon',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <Label.Root htmlFor={inputId} className="input-label">
            {label}
            {required && (
              <span className="input-label__required" aria-label="required">
                *
              </span>
            )}
          </Label.Root>
        )}
        <div className="input-container">
          {startIcon && (
            <span className="input-icon input-icon--start" aria-hidden="true">
              {startIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              [helperTextId, errorId].filter(Boolean).join(' ') || undefined
            }
            {...props}
          />
          {endIcon && (
            <span className="input-icon input-icon--end" aria-hidden="true">
              {endIcon}
            </span>
          )}
        </div>
        {helperText && !error && (
          <span id={helperTextId} className="input-helper-text">
            {helperText}
          </span>
        )}
        {error && (
          <span id={errorId} className="input-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
