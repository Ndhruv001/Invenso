import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  Save,
  X,
  Wallet,
  Calendar,
  CreditCard,
  BookOpen,
  Hash,
  FileText,
  Edit3,
  ArrowLeftRight,
  Type
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
import PAYMENT_MODES from "@/constants/PAYMENT_MODES"; // from your enum
import PAYMENT_TYPES from "@/constants/PAYMENT_TYPES";
import PAYMENT_REFERENCES from "@/constants/PAYMENT_REFERENCES";
import { paymentCreateSchema, paymentUpdateSchema } from "@/validations/paymentValidations";

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

const PaymentModal = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = null,
  mode = "view", // "view" | "edit" | "create"
  setMode = null
}) => {
  const { theme } = useTheme();

  /* ----------------------- PARTY INPUT ------------------------ */
  const [partyInputValue, setPartyInputValue] = useState(initialData?.party?.name || "");
  const [partySearchQuery, setPartySearchQuery] = useState("");
  const [partySuggestions, setPartySuggestions] = useState([]);
  const [showPartySuggestions, setShowPartySuggestions] = useState(false);
  const [selectedParty, setSelectedParty] = useState(initialData?.party || null);

  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // Default Values
  const defaultValues = useMemo(
    () => ({
      partyId: initialData?.partyId || "",
      type: initialData?.type || "",
      date: initialData?.date
        ? initialData.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      amount: initialData?.amount ?? "",
      paymentReference: initialData?.paymentReference || "",
      remark: initialData?.remark || "",
      paymentMode: initialData?.paymentMode || "",
      referenceType: initialData?.referenceType || ""
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
    resolver: initialData ? yupResolver(paymentUpdateSchema) : yupResolver(paymentCreateSchema),
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

  const isDisabled = mode === "view" || isSubmitting || isLoading;

  const submitHandler = handleSubmit(
    values => {
      let payload = values;
      if (initialData) {
        payload = extractModifiedFields(values, dirtyFields);
      }
      onSubmit(payload);
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
  }, [initialData, mode, setMode, isDirty, reset, defaultValues, onCancel, openDialog]);

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
      setMode(prev => (prev === "edit" ? "view" : "edit"));
    }
  }, [mode, setMode, isDirty, reset, defaultValues, onCancel, openDialog]);

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
                <Wallet className={`w-5 h-5 ${theme.text.primary}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>
                  {initialData
                    ? mode === "edit"
                      ? "Edit Payment"
                      : "View Payment"
                    : "Add Payment"}
                </h2>
                <p className={`text-sm ${theme.text.muted}`}>
                  {mode === "view" && initialData
                    ? "Payment details (read-only)"
                    : "Fill in the payment details below"}
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
                <div className="relative">
                  <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                    Party Name <span className="text-red-500">*</span>
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
                      <AlertCircle className="w-3 h-3" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    name="date"
                    label="Date"
                    type="date"
                    icon={Calendar}
                    required
                    register={register}
                    errors={errors}
                    mode={mode}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                  <SelectField
                    name="type"
                    label="Payment Type"
                    icon={Type}
                    options={PAYMENT_TYPES}
                    required
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
                    options={PAYMENT_MODES}
                    required
                    register={register}
                    errors={errors}
                    mode={mode}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                  <SelectField
                    name="referenceType"
                    label="Reference Type"
                    icon={BookOpen}
                    options={PAYMENT_REFERENCES}
                    required
                    register={register}
                    errors={errors}
                    mode={mode}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                </div>

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

                <TextField
                  name="amount"
                  label="Amount"
                  type="number"
                  placeholder="0.00"
                  icon={ArrowLeftRight}
                  required
                  register={register}
                  errors={errors}
                  mode={mode}
                  isDisabled={isDisabled}
                  theme={theme}
                />

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
                      : "Add Payment"}
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

export default PaymentModal;
