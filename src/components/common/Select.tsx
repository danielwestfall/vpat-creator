import React from 'react';
import * as Select from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const SelectComponent = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      placeholder = 'Select an option',
      value,
      defaultValue,
      onValueChange,
      options,
      fullWidth = false,
      required,
      disabled,
      id,
      className = '',
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const helperTextId = helperText ? `${selectId}-helper` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;

    const hasError = Boolean(error);

    const wrapperClasses = [
      'select-wrapper',
      fullWidth && 'select-wrapper--full-width',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <Label.Root htmlFor={selectId} className="select-label">
            {label}
            {required && (
              <span className="select-label__required" aria-label="required">
                *
              </span>
            )}
          </Label.Root>
        )}
        <Select.Root
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
          required={required}
        >
          <Select.Trigger
            ref={ref}
            id={selectId}
            className={`select-trigger ${hasError ? 'select-trigger--error' : ''}`}
            aria-invalid={hasError}
            aria-describedby={
              [helperTextId, errorId].filter(Boolean).join(' ') || undefined
            }
          >
            <Select.Value placeholder={placeholder} />
            <Select.Icon className="select-icon">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6L7.5 9.5L11 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="select-content" position="popper" sideOffset={5}>
              <Select.Viewport className="select-viewport">
                {options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className="select-item"
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator className="select-item-indicator">
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
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
        {helperText && !error && (
          <span id={helperTextId} className="select-helper-text">
            {helperText}
          </span>
        )}
        {error && (
          <span id={errorId} className="select-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

SelectComponent.displayName = 'Select';
