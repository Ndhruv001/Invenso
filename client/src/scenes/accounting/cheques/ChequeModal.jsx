import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  Save,
  X,
  Ticket, // Best representing a cheque leaf
  Calendar,
  Landmark,
  Hash,
  FileText,
  Edit3,
  ArrowLeftRight,
  Type,
  AlertCircle,
  Activity
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
import CHEQUE_TYPES from "@/constants/CHEQUE_TYPES";
import CHEQUE_STATUSES from "@/constants/CHEQUE_STATUSES";
import { chequeCreateSchema, chequeUpdateSchema } from "@/validations/chequeValidations";

// Keeps only modified fields for update payload
const extractModifiedFields = (currentFormValues, fieldsUserModified) => {
  const updatePayload = {};
  Object.keys(fieldsUserModified).forEach(fieldName => {
    if (fieldsUserModified[fieldName]) {
      updatePayload[fieldName] = currentFormValues[fieldName];
    }
  });
  return updatePayload;
};

const ChequeModal = ({
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

  // Default Values mapped to Cheque Schema
  const defaultValues = useMemo(
    () => ({
      chequeNumber: initialData?.chequeNumber || "",
      type: initialData?.type || "",
      status: initialData?.status || "",
      partyId: initialData?.partyId || "",
      amount: initialData?.amount ?? "",
      bankName: initialData?.bankName || "",
      chequeDate: initialData?.chequeDate
        ? initialData.chequeDate.split("T")[0]
        : new Date().toISOString().split("T")[0],
      depositDate: initialData?.depositDate ? initialData.depositDate.split("T")[0] : "",
      clearDate: initialData?.clearDate ? initialData.clearDate.split("T")[0] : "",
      bounceReason: initialData?.bounceReason || ""
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
    resolver: initialData ? yupResolver(chequeUpdateSchema) : yupResolver(chequeCreateSchema),
    mode: "onSubmit",
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
      }
    }
  );

  const handleCancel = useCallback(() => {
    if (initialData && mode === "edit" && isDirty) {
      openDialog({
        title: "Discard Changes?",
        message: "Are you sure you want to discard your changes?",
        onConfirm: async () => {
          reset(defaultValues);
          onCancel();
          setMode(null);
        }
      });
    } else {
      if (!initialData) reset(defaultValues);
      onCancel();
    }
  }, [initialData, mode, setMode, isDirty, reset, defaultValues, onCancel, openDialog]);

  const handleToggleEditMode = useCallback(() => {
    if (mode === "edit" && isDirty) {
      openDialog({
        title: "Discard Changes?",
        message: "You have unsaved changes. Discard and exit edit mode?",
        onConfirm: async () => {
          reset(defaultValues);
          setMode("view");
        }
      });
    } else {
      setMode(prev => (prev === "edit" ? "view" : "edit"));
    }
  }, [mode, setMode, isDirty, reset, defaultValues, openDialog]);

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
                <Ticket className={`w-5 h-5 ${theme.text.primary}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>
                  {initialData
                    ? mode === "edit"
                      ? "Edit Cheque"
                      : "View Cheque"
                    : "Add New Cheque"}
                </h2>
                <p className={`text-sm ${theme.text.muted}`}>
                  {mode === "view"
                    ? "Cheque details (read-only)"
                    : "Enter cheque instrument details"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {initialData && (
                <button
                  type="button"
                  onClick={handleToggleEditMode}
                  className={`p-2 ${theme.text.primary} ${theme.hover} rounded-lg cursor-pointer`}
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
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
          >
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {/* Party Selection Logic */}
                <div className="relative">
                  <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                    Party Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={partyInputValue}
                    disabled={isDisabled}
                    onChange={e => {
                      const value = e.target.value;
                      if (selectedParty) {
                        setSelectedParty(null);
                        setValue("partyId", null, { shouldDirty: true });
                      }
                      setPartyInputValue(value);
                      debouncedPartySearch(value);
                    }}
                    className={`w-full px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none ${theme.bg}`}
                  />
                  {showPartySuggestions && partySuggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-40 overflow-auto">
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
                    name="chequeNumber"
                    label="Cheque Number"
                    icon={Hash}
                    required
                    register={register}
                    errors={errors}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                  <TextField
                    name="bankName"
                    label="Bank Name"
                    icon={Landmark}
                    required
                    register={register}
                    errors={errors}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    name="type"
                    label="Cheque Type"
                    icon={ArrowLeftRight}
                    options={CHEQUE_TYPES}
                    required
                    register={register}
                    errors={errors}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                  <SelectField
                    name="status"
                    label="Status"
                    icon={Activity}
                    options={CHEQUE_STATUSES}
                    required
                    register={register}
                    errors={errors}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    name="amount"
                    label="Amount"
                    type="number"
                    icon={ArrowLeftRight}
                    required
                    register={register}
                    errors={errors}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                  <TextField
                    name="chequeDate"
                    label="Cheque Date"
                    type="date"
                    icon={Calendar}
                    required
                    register={register}
                    errors={errors}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                </div>

                {/* Status Specific Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    name="depositDate"
                    label="Deposit Date"
                    type="date"
                    icon={Calendar}
                    register={register}
                    errors={errors}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                  <TextField
                    name="clearDate"
                    label="Clear Date"
                    type="date"
                    icon={Calendar}
                    register={register}
                    errors={errors}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                </div>

                <TextAreaField
                  name="bounceReason"
                  label="Bounce Reason / Remark"
                  placeholder="Enter reason if bounced..."
                  icon={FileText}
                  register={register}
                  errors={errors}
                  isDisabled={isDisabled}
                  theme={theme}
                />
              </div>
            </div>

            {/* Footer Actions */}
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
                    ? "Processing..."
                    : initialData
                      ? "Update Cheque"
                      : "Save Cheque"}
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
        />
      )}
    </>
  );
};

export default ChequeModal;
