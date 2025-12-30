import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  Save,
  X,
  Users,
  MapPin,
  UserCheck,
  Phone,
  Hash,
  FileText,
  Edit3,
  CreditCard,
  DollarSign
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { TextField, TextAreaField, SelectField } from "@/components/common/FormFields";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { toast } from "react-toastify";
import partySchema from "@/validations/partySchema"; // move your yup schema here for cleaner separation

const PARTY_TYPES = [
  { id: "employee", name: "Employee" },
  { id: "buyer", name: "Buyer" },
  { id: "seller", name: "Seller" },
  { id: "both", name: "Both (Buyer & Seller)" }
];

const BALANCE_TYPES = [
  { id: "credit", name: "Credit" },
  { id: "debit", name: "Debit" }
];

const PartyModal = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = null,
  isViewOnly: isViewOnlyProp = false
}) => {
  const { theme } = useTheme();
  const [isEditMode, setIsEditMode] = useState(() => (initialData ? !isViewOnlyProp : true));
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  const defaultValues = useMemo(
    () => ({
      name: initialData?.name || "",
      landmark: initialData?.landmark || "",
      type: initialData?.type || "",
      phone: initialData?.phone || "",
      gst_number: initialData?.gst_number || "",
      remarks: initialData?.remarks || "",
      balance_type: initialData?.balance_type || "credit",
      amount: initialData?.amount ?? ""
    }),
    [initialData]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm({
    defaultValues,
    resolver: yupResolver(partySchema),
    mode: "onSubmit",
    reValidateMode: "onBlur"
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const isDisabled = !isEditMode || isSubmitting || isLoading;

  const submitHandler = handleSubmit(
    values => {
      const formattedData = {
        ...values,
        gst_number: values.gst_number?.toUpperCase() || null,
        amount: values.amount ? parseFloat(values.amount) : null
      };
      onSubmit(formattedData);
      if (initialData && isEditMode) {
        setIsEditMode(false);
      }
      if (!initialData) reset(defaultValues);
    },
    err => {
      if (Object.keys(err).length > 0)
        toast.error("Please fix validation errors before submitting.");
      else toast.error("An unexpected error occurred. Please try again.");
    }
  );

  const handleCancel = useCallback(() => {
    if (initialData && isEditMode && isDirty) {
      openDialog({
        title: "Discard Changes?",
        message: "Are you sure you want to discard unsaved changes?",
        onConfirm: async () => {
          reset(defaultValues);
          onCancel();
          setIsEditMode(false);
        }
      });
    } else {
      if (!initialData) reset(defaultValues);
      onCancel();
    }
  }, [initialData, isEditMode, isDirty, reset, defaultValues, onCancel, openDialog]);

  const handleToggleEditMode = useCallback(() => {
    if (isEditMode && isDirty) {
      openDialog({
        title: "Discard Changes?",
        message: "You have unsaved changes. Discard and exit edit mode?",
        onConfirm: async () => {
          reset(defaultValues);
          onCancel();
          setIsEditMode(false);
        }
      });
    } else {
      setIsEditMode(prev => !prev);
    }
  }, [isEditMode, isDirty, reset, defaultValues, onCancel, openDialog]);

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
                <Users className={`w-5 h-5 ${theme.text.primary}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>
                  {initialData ? (isEditMode ? "Edit Party" : "View Party") : "Add Party"}
                </h2>
                <p className={`text-sm ${theme.text.muted}`}>
                  {!isEditMode && initialData
                    ? "Party details (read-only)"
                    : "Fill in the party details below"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {initialData && (
                <button
                  type="button"
                  onClick={handleToggleEditMode}
                  className={`p-2 ${theme.text.primary} ${theme.hover} rounded-lg cursor-pointer`}
                  title={isEditMode ? "Exit edit mode" : "Enter edit mode"}
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
              {/* Basic Info */}
              <div className="space-y-4">
                <TextField
                  name="name"
                  label="Party Name"
                  placeholder="Enter party name"
                  icon={Users}
                  required
                  errors={errors}
                  register={register}
                  isEditMode={isEditMode}
                  initialData={initialData}
                  isDisabled={isDisabled}
                  theme={theme}
                />

                <TextField
                  name="landmark"
                  label="Landmark"
                  placeholder="Enter nearby landmark"
                  icon={MapPin}
                  required
                  errors={errors}
                  register={register}
                  isEditMode={isEditMode}
                  initialData={initialData}
                  isDisabled={isDisabled}
                  theme={theme}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    name="type"
                    label="Party Type"
                    icon={UserCheck}
                    options={PARTY_TYPES}
                    required
                    errors={errors}
                    register={register}
                    isEditMode={isEditMode}
                    initialData={initialData}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                  <TextField
                    name="phone"
                    label="Phone Number"
                    placeholder="Enter 10-digit phone number"
                    icon={Phone}
                    type="tel"
                    required
                    inputProps={{ inputMode: "numeric", maxLength: 10, pattern: "[0-9]*" }}
                    errors={errors}
                    register={register}
                    isEditMode={isEditMode}
                    initialData={initialData}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                </div>

                <TextField
                  name="gst_number"
                  label="GST Number"
                  placeholder="e.g., 22AAAAA0000A1Z5"
                  icon={Hash}
                  inputProps={{ maxLength: 15, style: { textTransform: "uppercase" } }}
                  errors={errors}
                  register={register}
                  isEditMode={isEditMode}
                  initialData={initialData}
                  isDisabled={isDisabled}
                  theme={theme}
                />

                <TextAreaField
                  name="remarks"
                  label="Remarks"
                  placeholder="Enter additional notes"
                  icon={FileText}
                  errors={errors}
                  register={register}
                  isEditMode={isEditMode}
                  initialData={initialData}
                  isDisabled={isDisabled}
                  theme={theme}
                />
              </div>

              {/* Opening Balance */}
              <div className="pt-6 border-t border-gray-200">
                <h3
                  className={`text-sm font-semibold ${theme.text.secondary} mb-4 flex items-center gap-2`}
                >
                  <div className="w-8 h-px bg-gray-300"></div>
                  Opening Balance
                  <div className="flex-1 h-px bg-gray-300"></div>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    name="balance_type"
                    label="Balance Type"
                    icon={CreditCard}
                    options={BALANCE_TYPES}
                    required
                    errors={errors}
                    register={register}
                    isEditMode={isEditMode}
                    initialData={initialData}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                  <TextField
                    name="amount"
                    label="Amount"
                    placeholder="0.00"
                    icon={DollarSign}
                    type="number"
                    inputProps={{ min: 0, step: "0.01", inputMode: "decimal" }}
                    errors={errors}
                    register={register}
                    isEditMode={isEditMode}
                    initialData={initialData}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`flex gap-3 p-6 border-t ${theme.border}`}>
              <button
                type="button"
                onClick={handleCancel}
                className={`flex-1 px-4 py-3 ${theme.bg} border ${theme.border} rounded-xl ${theme.hover} cursor-pointer`}
              >
                Cancel
              </button>

              {(isEditMode || !initialData) && (
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
                      : "Add Party"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
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

export default PartyModal;
