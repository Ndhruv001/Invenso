// /components/form/FormFields.js
import React from "react";
import { AlertCircle } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

// Generic Label
export const FieldLabel = React.memo(({ children, required = false }) => {
  const { theme } = useTheme();
  return (
    <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
      {children}
      {required && <span className="text-red-500">*</span>}
    </label>
  );
});

// Generic Error
export const FieldError = React.memo(({ message }) =>
  message ? (
    <p className="mt-2 flex items-center gap-1 text-red-600 text-sm" role="alert">
      <AlertCircle className="w-4 h-4" aria-hidden="true" />
      {message}
    </p>
  ) : null
);

// Generic Text Field
export const TextField = React.memo(
  ({
    name,
    label,
    defaultValue = "",
    placeholder,
    icon: Icon,
    type = "text",
    required = false,
    inputProps = {},
    errors = {},
    register,
    isEditMode,
    initialData,
    isDisabled = false,
    readOnly = false,
    theme
  }) => {
    const hasError = Boolean(errors?.[name]?.message);
    const errorMessage = errors?.[name]?.message;

    const shouldDisable = isDisabled || readOnly;

    return (
      <div>
        <FieldLabel required={required}>{label}</FieldLabel>

        <div className="relative">
          {Icon && (
            <Icon
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.text.muted}`}
              aria-hidden="true"
            />
          )}

          <input
            type={type}
            placeholder={!isEditMode && initialData ? "Not specified" : placeholder}
            aria-invalid={hasError}
            aria-describedby={`${name}-error`}
            disabled={shouldDisable}
            defaultValue={defaultValue}
            readOnly={readOnly}
            className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 border rounded-xl
              ${
                hasError
                  ? "border-red-300 bg-red-50"
                  : shouldDisable
                    ? "border-gray-200 bg-gray-100 cursor-not-allowed"
                    : theme.border
              }
              ${theme.text.primary} ${theme.bg}
              placeholder:${theme.text.muted}
              outline-none transition-all
              ${!shouldDisable ? "focus:border-blue-500 cursor-text" : ""}
            `}
            {...(!readOnly && register ? register(name) : {})}
            {...inputProps}
          />
        </div>

        <FieldError message={errorMessage} />
      </div>
    );
  }
);

// Generic Text Area
export const TextAreaField = React.memo(
  ({
    name,
    label,
    placeholder,
    icon: Icon,
    required = false,
    errors,
    register,
    isEditMode,
    initialData,
    isDisabled,
    theme
  }) => {
    const hasError = Boolean(errors[name]?.message);
    const errorMessage = errors[name]?.message;
    return (
      <div>
        <FieldLabel required={required}>{label}</FieldLabel>
        <div className="relative">
          {Icon && (
            <Icon
              className={`absolute left-3 top-3 w-4 h-4 ${theme.text.muted}`}
              aria-hidden="true"
            />
          )}
          <textarea
            {...register(name)}
            placeholder={!isEditMode && initialData ? "Not specified" : placeholder}
            disabled={isDisabled}
            rows={3}
            aria-invalid={hasError}
            aria-describedby={`${name}-error`}
            className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 border rounded-xl resize-none ${
              hasError
                ? "border-red-300 bg-red-50"
                : isDisabled
                  ? "border-gray-100 bg-gray-50"
                  : theme.border
            } ${theme.text.primary} ${theme.bg} placeholder:${theme.text.muted}
              outline-none transition-all ${
                isEditMode && !isDisabled ? "focus:border-blue-500 cursor-text" : "cursor-default"
              }`}
          />
        </div>
        <FieldError message={errorMessage} />
      </div>
    );
  }
);

// Generic Select Field
export const SelectField = React.memo(
  ({
    name,
    label,
    icon: Icon,
    options,
    required = false,
    placeholder = "Select",
    errors,
    register,
    isEditMode,
    isDisabled,
    initialData,
    theme
  }) => {
    const hasError = Boolean(errors[name]?.message);
    const errorMessage = errors[name]?.message;
    return (
      <div>
        <FieldLabel required={required}>{label}</FieldLabel>
        <div className="relative">
          {Icon && (
            <Icon
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              aria-hidden="true"
            />
          )}
          <select
            {...register(name)}
            defaultValue={initialData?.categoryId ?? ""}
            disabled={isDisabled}
            aria-invalid={hasError}
            aria-describedby={`${name}-error`}
            className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-3 border rounded-xl outline-none appearance-none transition-all 
              ${
                hasError
                  ? "border-red-300 bg-red-50"
                  : isDisabled
                    ? "border-gray-100 bg-gray-50"
                    : theme.border
              } ${theme.text.primary} ${theme.bg} 
              ${
                isEditMode && !isDisabled
                  ? "focus:border-blue-500 cursor-pointer"
                  : "cursor-default"
              }`}
          >
            <option value="">{!isEditMode && initialData ? "Not Specified" : placeholder}</option>
            {options.map(opt =>
              typeof opt === "string" ? (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ) : (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              )
            )}
          </select>
          {/* Chevron icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <FieldError message={errorMessage} />
      </div>
    );
  }
);
