import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  Save,
  X,
  Truck,
  Calendar,
  CreditCard,
  Hash,
  FileText,
  Edit3,
  ArrowLeftRight,
  MapPin,
  Users,
  UserCircle,
  Clock,
  DollarSign
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { TextField, TextAreaField, SelectField } from "@/components/common/FormFields";
import { usePartySuggestions } from "@/hooks/useParties";
import { debounce } from "@/lib/helpers/debounce";
import { PAYMENT_MODE_OPTIONS } from "@/constants/PAYMENT_MODES";
import { DRIVER_SHIFT_OPTIONS } from "@/constants/DRIVER_SHIFTS";
import { transportCreateSchema, transportUpdateSchema } from "@/validations/transportValidations";

// From all form values, keep only what the user actually changed.
const extractModifiedFields = (currentFormValues, fieldsUserModified) => {
  const updatePayload = {};

  Object.keys(fieldsUserModified).forEach(fieldName => {
    if (fieldsUserModified[fieldName]) {
      updatePayload[fieldName] = currentFormValues[fieldName];
    }
  });
  return updatePayload;
};

const TransportModal = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = null,
  mode="view",
  setMode=null
}) => {
  const { theme } = useTheme();

  /* ----------------------- PARTY INPUT ------------------------ */
  const [partyInputValue, setPartyInputValue] = useState(initialData?.party?.name || "");
  const [partySearchQuery, setPartySearchQuery] = useState("");
  const [partySuggestions, setPartySuggestions] = useState([]);
  const [showPartySuggestions, setShowPartySuggestions] = useState(false);
  const [selectedParty, setSelectedParty] = useState(initialData?.party || null);

  /* ----------------------- DRIVER INPUT ------------------------ */
  const [driverInputValue, setDriverInputValue] = useState(initialData?.driver?.name || "");
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [driverSuggestions, setDriverSuggestions] = useState([]);
  const [showDriverSuggestions, setShowDriverSuggestions] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(initialData?.driver || null);

  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // Default Values
  const defaultValues = useMemo(
    () => ({
      partyId: initialData?.partyId || "",
      driverId: initialData?.driverId || "",
      date: initialData?.date
        ? initialData.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      shift: initialData?.shift || "",
      fromLocation: initialData?.fromLocation || "",
      toLocation: initialData?.toLocation || "",
      amount: initialData?.amount ?? "",
      receivedAmount: initialData?.receivedAmount ?? "",
      paymentMode: initialData?.paymentMode || "",
      paymentReference: initialData?.paymentReference || "",
      remark: initialData?.remark || ""
    }),
    [initialData]
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty, dirtyFields }
  } = useForm({
    defaultValues,
    resolver: initialData ? yupResolver(transportUpdateSchema) : yupResolver(transportCreateSchema),
    mode: "onSubmit",
    reValidateMode: "onBlur"
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  /* --------------------- PARTY SUGGESTIONS ---------------------- */
  const { data: partySuggestionsData } = usePartySuggestions(partySearchQuery);

  const debouncedPartySearch = useMemo(
    () =>
      debounce(value => {
        if (!value) {
          setPartySuggestions([]);
          setShowPartySuggestions(false);
          return;
        }

        setPartySearchQuery(value);
        setShowPartySuggestions(true);
      }, 800),
    []
  );

  useEffect(() => {
    if (partySuggestionsData) {
      setPartySuggestions(partySuggestionsData);
    }
  }, [partySuggestionsData]);

  /* --------------------- DRIVER SUGGESTIONS ---------------------- */
  const { data: driverSuggestionsData } = usePartySuggestions(driverSearchQuery);

  const debouncedDriverSearch = useMemo(
    () =>
      debounce(value => {
        if (!value) {
          setDriverSuggestions([]);
          setShowDriverSuggestions(false);
          return;
        }

        setDriverSearchQuery(value);
        setShowDriverSuggestions(true);
      }, 800),
    []
  );

  useEffect(() => {
    if (driverSuggestionsData) {
      setDriverSuggestions(driverSuggestionsData);
    }
  }, [driverSuggestionsData]);

  const isDisabled = mode === "view" || isSubmitting || isLoading;

  const submitHandler = handleSubmit(
    values => {
      let payload = values;
      if (initialData) {
        payload = extractModifiedFields(values, dirtyFields);
      }
      onSubmit(payload);
      console.log("🚀 ~ TransportModal ~ payload:", payload);
      if (!initialData) reset(defaultValues);
      if (initialData && mode === "edit") {
        onCancel();
        setMode(null);
      }
    },
    errors => {
      if (Object.keys(errors).length > 0) {
        toast.error("Please fix validation errors before submitting.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  );

  const handleCancel = useCallback(() => {
    if (initialData && mode === "edit" && isDirty) {
      openDialog({
        title: "Discard Changes?",
        message: "Are you sure you want to discard your changes? All unsaved changes will be lost.",
        onConfirm: async () => {
          reset(defaultValues);
          onCancel();
          setMode(null);
        }
      });
    } else {
      if (!initialData) {
        reset(defaultValues);
      }
      onCancel();
    }
  }, [initialData, mode,setMode, isDirty, reset, defaultValues, onCancel, openDialog]);

  const handleToggleEditMode = useCallback(() => {
    if (mode === "edit" && isDirty) {
      openDialog({
        title: "Discard Changes?",
        message: "You have unsaved changes. Do you want to discard them and exit edit mode?",
        onConfirm: async () => {
          reset(defaultValues);
          onCancel();
          setMode(null);
        }
      });
    } else {
      setMode(prev => prev === "edit" ? "view" : "edit");
    }
  }, [mode,setMode, isDirty, reset, defaultValues, onCancel, openDialog]);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div
          className={`${theme.card} rounded-2xl shadow-2xl w-full max-w-2xl border ${theme.border} max-h-[90vh] flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${theme.border}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.accent}`}>
                <Truck className={`w-5 h-5 ${theme.text.primary}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>
                  {initialData
                    ? mode === "edit"
                      ? "Edit Transport"
                      : "View Transport"
                    : "Add Transport"}
                </h2>
                <p className={`text-sm ${theme.text.muted}`}>
                  { mode === "view" && initialData
                    ? "Transport details (read-only)"
                    : "Fill in the transport details below"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {initialData && (
                <button
                  type="button"
                  onClick={handleToggleEditMode}
                  className={`p-2 ${theme.text.primary} ${theme.hover} rounded-lg cursor-pointer`}
                  title={mode === "edit" ? "Exit edit mode" : "Enter edit mode"}
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={submitHandler}
            className="flex-1 flex flex-col overflow-y-auto"
            noValidate
            spellCheck={false}
          >
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {/* Party Name */}
                <div className="relative">
                  <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Party Name <span className="text-red-500">*</span>
                    </div>
                  </label>

                  <input
                    type="text"
                    value={partyInputValue}
                    disabled={isDisabled}
                    {...register("partyName", { required: "Party Name is required" })}
                    onChange={e => {
                      const value = e.target.value;

                      // Clear selected party if user types
                      if (selectedParty) {
                        setSelectedParty(null);
                        setValue("partyId", null, { shouldDirty: true });
                      }

                      setPartyInputValue(value);
                      debouncedPartySearch(value);
                    }}
                    className={`w-full px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none ${theme.bg}`}
                  />

                  {errors.partyName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      {errors.partyName.message}
                    </p>
                  )}

                  {showPartySuggestions && partySuggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow">
                      {partySuggestions.map(party => (
                        <li
                          key={party.id}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSelectedParty(party);
                            setPartyInputValue(party.name);
                            setValue("partyId", party.id, { shouldDirty: true });
                            setShowPartySuggestions(false);
                          }}
                        >
                          {party.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Driver Name */}
                <div className="relative">
                  <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4" />
                      Driver Name <span className="text-red-500">*</span>
                    </div>
                  </label>

                  <input
                    type="text"
                    value={driverInputValue}
                    disabled={isDisabled}
                    {...register("driverName", { required: "Driver Name is required" })}
                    onChange={e => {
                      const value = e.target.value;

                      // Clear selected driver if user types
                      if (selectedDriver) {
                        setSelectedDriver(null);
                        setValue("driverId", null, { shouldDirty: true });
                      }

                      setDriverInputValue(value);
                      debouncedDriverSearch(value);
                    }}
                    className={`w-full px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none ${theme.bg}`}
                  />

                  {errors.driverName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      {errors.driverName.message}
                    </p>
                  )}

                  {showDriverSuggestions && driverSuggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow">
                      {driverSuggestions.map(driver => (
                        <li
                          key={driver.id}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSelectedDriver(driver);
                            setDriverInputValue(driver.name);
                            setValue("driverId", driver.id, { shouldDirty: true });
                            setShowDriverSuggestions(false);
                          }}
                        >
                          {driver.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    name="date"
                    label="Date"
                    type="date"
                    icon={Calendar}
                    required
                    register={register}
                    errors={errors}
                    model={mode}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                  <SelectField
                    name="shift"
                    label="Shift"
                    icon={Clock}
                    options={DRIVER_SHIFT_OPTIONS}
                    register={register}
                    errors={errors}
                    model={mode}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    name="fromLocation"
                    label="From Location"
                    placeholder="Starting point"
                    icon={MapPin}
                    required
                    register={register}
                    errors={errors}
                    model={mode}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                  <TextField
                    name="toLocation"
                    label="To Location"
                    placeholder="Destination"
                    icon={MapPin}
                    required
                    register={register}
                    errors={errors}
                    mode={mode}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    name="amount"
                    label="Amount"
                    type="number"
                    placeholder="0.00"
                    icon={DollarSign}
                    required
                    register={register}
                    errors={errors}
                    model={mode}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                  <TextField
                    name="receivedAmount"
                    label="Received Amount"
                    type="number"
                    placeholder="0.00"
                    icon={ArrowLeftRight}
                    register={register}
                    errors={errors}
                    mode={mode}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    name="paymentMode"
                    label="Payment Mode"
                    icon={CreditCard}
                    options={PAYMENT_MODE_OPTIONS}
                    register={register}
                    errors={errors}
                    mode={mode}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                  <TextField
                    name="paymentReference"
                    label="Payment Reference"
                    placeholder="Transaction ID / Cheque No"
                    icon={Hash}
                    register={register}
                    errors={errors}
                    mode={mode}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                </div>

                <TextAreaField
                  name="remark"
                  label="Remark"
                  placeholder="Add remark or note"
                  icon={FileText}
                  register={register}
                  errors={errors}
                  mode={mode}
                  isDisabled={isDisabled}
                  theme={theme}
                />
              </div>
            </div>

            <div className={`flex gap-3 p-6 border-t ${theme.border}`}>
              <button
                type="button"
                onClick={handleCancel}
                className={`flex-1 px-4 py-3 ${theme.bg} border ${theme.border} rounded-xl ${theme.hover} cursor-pointer`}
              >
                Cancel
              </button>
              {(mode === "edit" || !initialData) && (
                <button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r ${theme.accentFrom} ${theme.accentTo} ${theme.text.primary} transition-all ${
                    isLoading || isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:opacity-90 cursor-pointer"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {isLoading || isSubmitting
                    ? initialData
                      ? "Saving..."
                      : "Adding..."
                    : initialData
                      ? "Save Changes"
                      : "Add Transport"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {dialogConfig.isOpen && (
        <ConfirmationModal
          isOpen={dialogConfig.isOpen}
          title={dialogConfig.title}
          message={dialogConfig.message}
          onConfirm={dialogConfig.onConfirm}
          onCancel={closeDialog}
          isLoading={dialogConfig.isLoading}
        />
      )}
    </>
  );
};

export default TransportModal;
