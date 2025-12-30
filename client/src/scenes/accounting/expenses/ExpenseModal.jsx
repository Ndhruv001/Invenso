import React, { useMemo, useEffect, useState, useCallback } from "react";
import {
  Save,
  X,
  Calendar,
  DollarSign,
  FileText,
  Edit3,
  Layers,
  CreditCard,
  Hash
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import expenseValidations from "@/validations/expenseValidations";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "react-toastify";
import PaymentModeOptions from "@/constants/PAYMENT_MODES";
import { SelectField, TextField, TextAreaField } from "@/components/common/FormFields";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";

const ExpenseModal = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = null,
  isViewOnly: isViewOnlyProp = false
}) => {
  const { theme } = useTheme();
  const { data: expenseCategories } = useCategories("EXPENSE");
  const [isEditMode, setIsEditMode] = useState(() => (initialData ? !isViewOnlyProp : true));

  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  const defaultValues = useMemo(
    () => ({
      categoryId: initialData?.categoryId || "",
      amount: initialData?.amount ?? "",
      date: initialData?.date
        ? initialData.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      paymentMode: initialData?.paymentMode || "CASH",
      paymentReference: initialData?.paymentReference || "",
      remark: initialData?.remark || ""
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
    resolver: yupResolver(expenseValidations),
    mode: "onSubmit",
    reValidateMode: "onBlur"
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const categoryOptions = useMemo(
    () => expenseCategories?.map(cat => ({ value: String(cat.id), label: cat.name })) || [],
    [expenseCategories]
  );

  const isDisabled = !isEditMode || isSubmitting || isLoading;

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
        message: "You have unsaved changes. Do you want to discard them and exit edit mode?",
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

  const submitHandler = handleSubmit(
    values => {
      onSubmit(values);
      if (!initialData) reset(defaultValues);
      if (initialData && isEditMode) {
        onCancel();
        setIsEditMode(false);
      }
    },
    errors => {
      if (Object.keys(errors).length > 0)
        toast.error("Please fix validation errors before submitting.");
      else toast.error("An unexpected error occurred. Please try again.");
    }
  );

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
                <DollarSign className={`w-5 h-5 ${theme.text.primary}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>
                  {initialData ? (isEditMode ? "Edit Expense" : "View Expense") : "Add Expense"}
                </h2>
                <p className={`text-sm ${theme.text.muted}`}>
                  {!isEditMode && initialData
                    ? "Expense details (read-only)"
                    : "Fill in the expense details below"}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  name="categoryId"
                  label="Category"
                  icon={Layers}
                  required
                  options={categoryOptions}
                  register={register}
                  errors={errors}
                  isEditMode={isEditMode}
                  isDisabled={isDisabled}
                  theme={theme}
                />
                <TextField
                  name="date"
                  label="Date"
                  icon={Calendar}
                  type="date"
                  required
                  register={register}
                  errors={errors}
                  isEditMode={isEditMode}
                  isDisabled={isDisabled}
                  theme={theme}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  name="amount"
                  label="Amount"
                  placeholder="0.00"
                  icon={DollarSign}
                  type="number"
                  required
                  register={register}
                  errors={errors}
                  isEditMode={isEditMode}
                  isDisabled={isDisabled}
                  theme={theme}
                />
                <SelectField
                  name="paymentMode"
                  label="Payment Mode"
                  icon={CreditCard}
                  required
                  options={Object.values(PaymentModeOptions).map(mode => ({
                    label: mode
                      .replace(/_/g, " ")
                      .toLowerCase()
                      .replace(/\b\w/g, w => w.toUpperCase()),
                    value: mode
                  }))}
                  register={register}
                  errors={errors}
                  isEditMode={isEditMode}
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
                isEditMode={isEditMode}
                isDisabled={isDisabled}
                theme={theme}
              />

              <TextAreaField
                name="remark"
                label="Remark"
                placeholder="Add a remark for this expense"
                icon={FileText}
                register={register}
                errors={errors}
                isEditMode={isEditMode}
                isDisabled={isDisabled}
                theme={theme}
              />
            </div>

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
                      : "Add Expense"}
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

export default ExpenseModal;
