import React, { useMemo, useEffect, useState, useCallback, use } from "react";
import { Save, X, Package, Hash, Layers, Scale, Edit3, Target, FileText } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { productCreateSchema, productUpdateSchema } from "@/validations/productValidations";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import UNITS from "@/constants/UNIT_TYPES";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useCategories } from "@/hooks/useCategories";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { TextField, TextAreaField, SelectField } from "@/components/common/FormFields";
import { toast } from "react-toastify";

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

const ProductModal = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = null,
  isViewOnly: isViewOnlyProp = false
}) => {
  const { theme } = useTheme();
  const { data: productCategories } = useCategories("PRODUCT");

  const [isEditMode, setIsEditMode] = useState(() => (initialData ? !isViewOnlyProp : true));

  // Use custom confirmation dialog hook
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // Memoize default values for react-hook-form
  const defaultValues = useMemo(
    () => ({
      name: initialData?.name || "",
      categoryId: initialData?.categoryId || "",
      hsnCode: initialData?.hsnCode || "",
      unit: initialData?.unit || "",
      threshold: initialData?.threshold ?? "",
      description: initialData?.description || "",
      openingStock: initialData?.openingStock ?? ""
    }),
    [initialData]
  );

  // React Hook Form setup (maintains controlled form state)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty, dirtyFields }
  } = useForm({
    defaultValues,
    resolver: initialData ? yupResolver(productUpdateSchema) : yupResolver(productCreateSchema),
    mode: "onSubmit",
    reValidateMode: "onBlur"
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const isDisabled = !isEditMode || isSubmitting || isLoading;

  const submitHandler = handleSubmit(
    currentFormValues => {
      let updatePayload = currentFormValues;

      // EDIT MODE → send only changed fields
      if (initialData) {
        updatePayload = extractModifiedFields(currentFormValues, dirtyFields);

        if (Object.keys(updatePayload).length === 0) {
          toast.info("No changes detected");
          return;
        }
      }

      onSubmit(updatePayload);

      // CREATE MODE → reset form
      if (!initialData) {
        reset(defaultValues);
      }

      // EDIT MODE → close modal
      if (initialData && isEditMode) {
        onCancel();
        setIsEditMode(false);
      }
    },
    formErrors => {
      if (Object.keys(formErrors).length > 0) {
        toast.error("Please fix validation errors before submitting.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  );

  const handleCancel = useCallback(() => {
    if (initialData && isEditMode && isDirty) {
      openDialog({
        title: "Discard Changes?",
        message: "Are you sure you want to discard your changes? All unsaved changes will be lost.",
        onConfirm: async () => {
          reset(defaultValues);
          onCancel();
          setIsEditMode(false);
        }
      });
    } else {
      if (!initialData) {
        reset(defaultValues);
      }
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
                <Package className={`w-5 h-5 ${theme.text.primary}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>
                  {initialData ? (isEditMode ? "Edit Product" : "View Product") : "Add Product"}
                </h2>
                <p className={`text-sm ${theme.text.muted}`}>
                  {!isEditMode && initialData
                    ? "Product details (read-only)"
                    : "Fill in the product details below"}
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
          {/* Form and Footer */}
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
                  label="Product Name"
                  placeholder="Enter product name"
                  icon={Package}
                  required={true}
                  errors={errors}
                  register={register}
                  isEditMode={isEditMode}
                  initialData={initialData}
                  isDisabled={isDisabled}
                  theme={theme}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    name="categoryId"
                    label="Category"
                    icon={Layers}
                    options={productCategories || []}
                    required={true}
                    errors={errors}
                    register={register}
                    isEditMode={isEditMode}
                    isDisabled={isDisabled}
                    initialData={initialData}
                    theme={theme}
                  />
                  <TextField
                    name="hsnCode"
                    label="HSN Code"
                    placeholder="e.g., 8471"
                    icon={Hash}
                    type="text"
                    errors={errors}
                    register={register}
                    isEditMode={isEditMode}
                    initialData={initialData}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    name="unit"
                    label="Unit"
                    icon={Scale}
                    options={UNITS}
                    required={true}
                    errors={errors}
                    register={register}
                    isEditMode={isEditMode}
                    isDisabled={initialData ? true : isDisabled}
                    initialData={initialData}
                    theme={theme}
                  />
                  <TextField
                    name="threshold"
                    label="Threshold"
                    placeholder="Minimum stock level"
                    icon={Target}
                    type="number"
                    errors={errors}
                    register={register}
                    isEditMode={isEditMode}
                    initialData={initialData}
                    isDisabled={isDisabled}
                    theme={theme}
                  />
                </div>
                <TextAreaField
                  name="description"
                  label="Description"
                  placeholder="Enter product description"
                  icon={FileText}
                  errors={errors}
                  register={register}
                  isEditMode={isEditMode}
                  initialData={initialData}
                  isDisabled={isDisabled}
                  theme={theme}
                />
              </div>
              {/* Opening Stock */}
              <div className="pt-6">
                <h3
                  className={`text-sm font-semibold ${theme.text.secondary} mb-4 flex items-center gap-2`}
                >
                  <div className="w-8 h-px bg-gray-300"></div>
                  Opening Stock
                  <div className="flex-1 h-px bg-gray-300"></div>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    name="openingStock"
                    label="Opening Stock Quantity"
                    placeholder="0"
                    type="number"
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
                      : "Add Product"}
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

export default ProductModal;
