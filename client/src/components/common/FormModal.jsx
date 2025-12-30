import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Save, X, Edit3 } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import ConfirmationModal from "@/components/common/ConfirmationModal";

const FormModal = ({
  // --- Configuration Props ---
  title,
  icon: Icon,
  initialData = null,
  validationSchema,
  isViewOnly: isViewOnlyProp = false,

  // --- Event Handler Props ---
  onSubmit,
  onCancel,

  // --- Content Prop ---
  children,
}) => {
  const { theme } = useTheme();
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  const [isEditMode, setIsEditMode] = useState(() => (initialData ? !isViewOnlyProp : true));

  const defaultValues = useMemo(() => initialData || {}, [initialData]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues,
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const isDisabled = !isEditMode || isSubmitting;

  const handleCancel = useCallback(() => {
    if (isDirty && isEditMode) {
      openDialog({
        title: "Discard Changes?",
        message: "You have unsaved changes. Are you sure you want to discard them?",
        onConfirm: () => {
          reset(defaultValues);
          onCancel();
        },
      });
    } else {
      onCancel();
    }
  }, [isDirty, isEditMode, onCancel, openDialog, reset, defaultValues]);
  
  const submitHandler = handleSubmit(formData => onSubmit(formData));

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className={` ${theme.card} rounded-2xl shadow-2xl w-full max-w-2xl border ${theme.border} max-h-[90vh] flex flex-col overflow-hidden`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${theme.border}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.accent}`}><Icon className={`w-5 h-5 ${theme.text.primary}`} /></div>
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>{title}</h2>
                <p className={`text-sm ${theme.text.muted}`}>
                  {isEditMode ? "Fill in the details below" : "Details (read-only)"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                {initialData && <button type="button" onClick={() => setIsEditMode(p => !p)} className={`p-2 ${theme.text.primary} ${theme.hover} rounded-lg`}><Edit3 className="w-5 h-5" /></button>}
                <button type="button" onClick={handleCancel} className="p-2 text-gray-400 hover:text-red-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={submitHandler} className="flex-1 flex flex-col overflow-y-auto">
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* This is where the specific form fields will be rendered! */}
              {children({ register, control, errors, isDisabled })}
            </div>
            
            {/* Footer */}
            <div className={`flex gap-3 p-6 border-t ${theme.border}`}>
              <button type="button" onClick={handleCancel} className={`flex-1 px-4 py-3 ${theme.bg} border ${theme.border} rounded-xl ${theme.hover}`}>Cancel</button>
              {isEditMode && <button type="submit" disabled={isSubmitting} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r ${theme.accentFrom} ${theme.accentTo} ${theme.text.primary} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}><Save className="w-4 h-4" />{isSubmitting ? "Saving..." : "Save Changes"}</button>}
            </div>
          </form>
        </div>
      </div>
      <ConfirmationModal {...dialogConfig} onCancel={closeDialog} />
    </>
  );
};

export default FormModal; 