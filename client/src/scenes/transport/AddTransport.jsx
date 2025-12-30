import React, { useMemo, useEffect, useState } from "react";
import {
  Save,
  X,
  Truck,
  Users,
  Calendar,
  User,
  Clock,
  MapPin,
  Navigation,
  DollarSign,
  Banknote,
  FileText,
  Edit3,
  AlertCircle
} from "lucide-react";
import useTheme from "@/hooks/useTheme";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Yup validation schema
const transportationSchema = yup.object().shape({
  party_name: yup
    .string()
    .required("Party name is required")
    .min(2, "Party name must be at least 2 characters")
    .max(100, "Party name must not exceed 100 characters"),
  
  date: yup
    .string()
    .required("Date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date"),
  
  driver_name: yup
    .string()
    .required("Driver name is required")
    .min(2, "Driver name must be at least 2 characters")
    .max(50, "Driver name must not exceed 50 characters"),
  
  shift: yup
    .string()
    .required("Shift is required")
    .oneOf(["morning", "night", "sunday"], "Invalid shift selection"),
  
  location_from: yup
    .string()
    .required("From location is required")
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must not exceed 100 characters"),
  
  location_to: yup
    .string()
    .required("To location is required")
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must not exceed 100 characters"),
  
  amount: yup
    .number()
    .required("Amount is required")
    .positive("Amount must be greater than 0")
    .max(99999999.99, "Amount is too large")
    .typeError("Please enter a valid amount"),
  
  receive_amount: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      return originalValue === "" ? null : value;
    })
    .min(0, "Received amount cannot be negative")
    .max(99999999.99, "Received amount is too large")
    .typeError("Please enter a valid received amount"),
  
  remarks: yup
    .string()
    .max(400, "Remarks must not exceed 400 characters")
});

// Demo constants
const SHIFTS = [
  { id: "morning", name: "Morning Shift" },
  { id: "night", name: "Night Shift" },
  { id: "sunday", name: "Sunday Special" }
];

const AddTransport = ({
  onSubmit = () => {},
  onCancel = () => {},
  isLoading = false,
  initialData = null
}) => {
  const { theme } = useTheme();
  const [isEditMode, setIsEditMode] = useState(!initialData);

  // react-hook-form setup
  const defaultValues = useMemo(
    () => ({
      party_name: initialData?.party_name || "",
      date: initialData?.date || new Date().toISOString().split('T')[0],
      driver_name: initialData?.driver_name || "",
      shift: initialData?.shift || "",
      location_from: initialData?.location_from || "",
      location_to: initialData?.location_to || "",
      amount: initialData?.amount ?? "",
      receive_amount: initialData?.receive_amount ?? "",
      remarks: initialData?.remarks || ""
    }),
    [initialData]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues,
    resolver: yupResolver(transportationSchema),
    mode: "onSubmit",
    reValidateMode: "onBlur"
  });

  // Keep the form in sync if initialData changes
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // Toggle edit mode
  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  // Field components
  const FieldLabel = ({ children, required }) => (
    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1.5`}>
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  const FieldError = ({ message }) =>
    message ? (
      <p className="mt-1.5 flex items-center gap-1 text-red-600 text-xs">
        <AlertCircle className="w-3 h-3" />
        {message}
      </p>
    ) : null;

  const TextField = ({
    name,
    label,
    placeholder,
    icon: Icon,
    type = "text",
    required = false,
    disabled = false,
    inputProps = {}
  }) => {
    const hasError = !!errors?.[name]?.message;
    const isDisabled = (!isEditMode && initialData) || disabled || isSubmitting || isLoading;
    
    return (
      <div>
        <FieldLabel required={required}>{label}</FieldLabel>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          )}
          <input
            type={type}
            {...register(name)}
            placeholder={!isEditMode && initialData ? "Not specified" : placeholder}
            disabled={isDisabled}
            className={`w-full ${Icon ? "pl-10" : "pl-3"} pr-3 py-2.5 text-sm border rounded-lg ${theme.text.primary} placeholder:${theme.text.muted} outline-none transition-all ${
              hasError
                ? "border-red-300 bg-red-50"
                : !isEditMode && initialData
                ? "border-gray-100 bg-gray-50"
                : theme.border
            } ${isEditMode && !disabled ? "focus:border-blue-500 cursor-pointer" : "cursor-default"}`}
            {...inputProps}
          />
        </div>
        <FieldError message={errors?.[name]?.message} />
      </div>
    );
  };

  const TextAreaField = ({
    name,
    label,
    placeholder,
    icon: Icon,
    required = false,
    disabled = false
  }) => {
    const hasError = !!errors?.[name]?.message;
    const isDisabled = (!isEditMode && initialData) || disabled || isSubmitting || isLoading;
    
    return (
      <div>
        <FieldLabel required={required}>{label}</FieldLabel>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          )}
          <textarea
            {...register(name)}
            placeholder={!isEditMode && initialData ? "Not specified" : placeholder}
            disabled={isDisabled}
            rows={2}
            className={`w-full ${Icon ? "pl-10" : "pl-3"} pr-3 py-2.5 text-sm border rounded-lg ${theme.text.primary} placeholder:${theme.text.muted} outline-none transition-all resize-none ${
              hasError
                ? "border-red-300 bg-red-50"
                : !isEditMode && initialData
                ? "border-gray-100 bg-gray-50"
                : theme.border
            } ${isEditMode && !disabled ? "focus:border-blue-500 cursor-pointer" : "cursor-default"}`}
          />
        </div>
        <FieldError message={errors?.[name]?.message} />
      </div>
    );
  };

  const SelectField = ({
    name,
    label,
    icon: Icon,
    options,
    required = false,
    disabled = false,
    placeholder = "Select"
  }) => {
    const hasError = !!errors?.[name]?.message;
    const isDisabled = (!isEditMode && initialData) || disabled || isSubmitting || isLoading;
    
    return (
      <div>
        <FieldLabel required={required}>{label}</FieldLabel>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          )}
          <select
            {...register(name)}
            disabled={isDisabled}
            className={`w-full ${Icon ? "pl-10" : "pl-3"} pr-8 py-2.5 text-sm border rounded-lg outline-none appearance-none transition-all ${
              hasError
                ? "border-red-300 bg-red-50"
                : !isEditMode && initialData
                ? "border-gray-100 bg-gray-50"
                : theme.border
            } ${isEditMode && !disabled ? "focus:border-blue-500 cursor-pointer" : "cursor-default"}`}
          >
            <option value="">{!isEditMode && initialData ? "Not specified" : placeholder}</option>
            {options.map((opt) =>
              typeof opt === "string" ? (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ) : (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              )
            )}
          </select>
        </div>
        <FieldError message={errors?.[name]?.message} />
      </div>
    );
  };

  // Handlers
  const submitHandler = handleSubmit((values) => {
    // Format the data before submission
    const formattedData = {
      ...values,
      amount: parseFloat(values.amount),
      receive_amount: values.receive_amount ? parseFloat(values.receive_amount) : null
    };
    
    onSubmit(formattedData);
    if (initialData && isEditMode) {
      setIsEditMode(false);
    }
  });

  const cancelHandler = () => {
    if (initialData && isEditMode) {
      setIsEditMode(false);
      reset(defaultValues);
    } else {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className={`${theme.card} rounded-xl shadow-2xl w-full max-w-lg border ${theme.border} max-h-[90vh] flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${theme.border}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.accent}`}>
              <Truck className={`w-5 h-5 ${theme.text.primary}`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${theme.text.primary}`}>
                {initialData 
                  ? (isEditMode ? "Edit Transportation" : "View Transportation") 
                  : "Add Transportation"
                }
              </h2>
              <p className={`text-sm ${theme.text.muted}`}>
                {!isEditMode && initialData 
                  ? "Transportation details (read-only)" 
                  : "Record transportation details"
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {initialData && (
              <button
                type="button"
                onClick={handleEditToggle}
                className={`p-2 ${theme.text.primary} ${theme.hover} rounded-lg cursor-pointer transition-colors`}
                title={isEditMode ? "Cancel edit" : "Edit transportation"}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onCancel()}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={submitHandler} className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <TextField
              name="party_name"
              label="Party Name"
              placeholder="Enter party name"
              icon={Users}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <TextField
                name="date"
                label="Date"
                type="date"
                icon={Calendar}
                required
              />

              <TextField
                name="driver_name"
                label="Driver Name"
                placeholder="Enter driver name"
                icon={User}
                required
              />
            </div>

            <SelectField
              name="shift"
              label="Shift"
              icon={Clock}
              options={SHIFTS}
              required
            />

            {/* Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                name="location_from"
                label="From Location"
                placeholder="Starting point"
                icon={MapPin}
                required
              />

              <TextField
                name="location_to"
                label="To Location"
                placeholder="Destination"
                icon={Navigation}
                required
              />
            </div>

            {/* Amount Details */}
            <div className="grid grid-cols-2 gap-4">
              <TextField
                name="amount"
                label="Amount"
                placeholder="0.00"
                icon={DollarSign}
                type="number"
                required
                inputProps={{ 
                  min: 0, 
                  step: "0.01",
                  inputMode: "decimal"
                }}
              />

              <TextField
                name="receive_amount"
                label="Received Amount"
                placeholder="0.00"
                icon={Banknote}
                type="number"
                inputProps={{ 
                  min: 0, 
                  step: "0.01",
                  inputMode: "decimal"
                }}
              />
            </div>

            <TextAreaField
              name="remarks"
              label="Remarks"
              placeholder="Additional notes (optional)"
              icon={FileText}
            />
          </div>
        </form>

        {/* Footer */}
        <div className={`flex gap-3 p-5 border-t ${theme.border}`}>
          <button
            type="button"
            onClick={cancelHandler}
            className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {initialData && isEditMode ? "Cancel" : "Cancel"}
          </button>

          {(isEditMode || !initialData) && (
            <button
              type="submit"
              onClick={submitHandler}
              disabled={isLoading || isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-gradient-to-r ${theme.accentFrom} ${theme.accentTo} text-white transition-all ${
                isLoading || isSubmitting 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:opacity-90 cursor-pointer"
              }`}
            >
              <Save className="w-4 h-4" />
              {isLoading || isSubmitting 
                ? "Saving..." 
                : initialData 
                  ? "Save Changes" 
                  : "Add Transportation"
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTransport;