import React, { useMemo, useEffect, useCallback } from "react";
import { Save, X, Layers, Edit3, FileText } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { categoryCreateSchema, categoryUpdateSchema } from "@/validations/categoryValidations";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { TextField, TextAreaField } from "@/components/common/FormFields";
import { toast } from "react-toastify";

/**
 * Extract only modified fields (same logic as ProductModal)
 */
const extractModifiedFields = (currentFormValues, dirtyFields) => {
  const updatePayload = {};

  Object.keys(dirtyFields).forEach(fieldName => {
    if (dirtyFields[fieldName]) {
      updatePayload[fieldName] = currentFormValues[fieldName];
    }
  });

  return updatePayload;
};

const CategoryModal = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = null,
  mode = "view", // "view" | "edit" | "create"
  setMode = () => {}
}) => {
  const { theme } = useTheme();
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  const defaultValues = useMemo(
    () => ({
      name: initialData?.name || "",
      description: initialData?.description || ""
    }),
    [initialData]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty, dirtyFields }
  } = useForm({
    defaultValues,
    resolver: initialData ? yupResolver(categoryUpdateSchema) : yupResolver(categoryCreateSchema),
    mode: "onSubmit",
    reValidateMode: "onBlur"
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const isDisabled = mode === "view" || isSubmitting || isLoading;

  const submitHandler = handleSubmit(
    currentFormValues => {
      let payload = currentFormValues;

      // EDIT MODE → send only changed fields
      if (initialData) {
        payload = extractModifiedFields(currentFormValues, dirtyFields);

        if (Object.keys(payload).length === 0) {
          toast.info("No changes detected");
          return;
        }
      }

      onSubmit(payload);

      // CREATE MODE → reset
      if (!initialData) {
        reset(defaultValues);
      }

      // EDIT MODE → close
      if (initialData && mode === "edit") {
        onCancel();
        setMode(null);
      }
    },
    formErrors => {
      if (Object.keys(formErrors).length > 0) {
        toast.error("Please fix validation errors before submitting.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  );

  const handleCancel = useCallback(() => {
    if (initialData && mode === "edit" && isDirty) {
      openDialog({
        title: "Discard Changes?",
        message: "You have unsaved changes. Are you sure you want to discard them?",
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
  }, [initialData, mode, isDirty, reset, defaultValues, onCancel, openDialog, setMode]);

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
      setMode(prev => (prev === "view" ? "edit" : "view"));
    }
  }, [mode, isDirty, reset, defaultValues, onCancel, openDialog, setMode]);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div
          className={`${theme.card} rounded-2xl shadow-2xl w-full max-w-xl border ${theme.border} max-h-[90vh] flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${theme.border}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.accent}`}>
                <Layers className={`w-5 h-5 ${theme.text.primary}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>
                  {initialData
                    ? mode === "edit"
                      ? "Edit Category"
                      : "View Category"
                    : "Add Category"}
                </h2>
                <p className={`text-sm ${theme.text.muted}`}>
                  {mode === "view" && initialData
                    ? "Category details (read-only)"
                    : "Fill in the category details below"}
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
            spellCheck={false}
          >
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <TextField
                name="name"
                label="Category Name"
                placeholder="Enter category name"
                icon={Layers}
                required={true}
                errors={errors}
                register={register}
                mode={mode}
                initialData={initialData}
                isDisabled={isDisabled}
                theme={theme}
              />

              <TextAreaField
                name="description"
                label="Description"
                placeholder="Enter category description"
                icon={FileText}
                errors={errors}
                register={register}
                mode={mode}
                initialData={initialData}
                isDisabled={isDisabled}
                theme={theme}
              />
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
                      : "Add Category"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation */}
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

export default CategoryModal;
export { CategoryModal };
