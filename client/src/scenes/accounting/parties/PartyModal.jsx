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
import { partyCreateSchema, partyUpdateSchema } from "@/validations/partyValidations";
import { PARTY_TYPE_OPTIONS } from "@/constants/PARTY_TYPES";
import {useCreateParty} from "@/hooks/useParties";

// -----------------------------------
// Helpers
// -----------------------------------
const extractModifiedFields = (currentValues, dirtyFields) => {
  const payload = {};
  Object.keys(dirtyFields).forEach(key => {
    if (dirtyFields[key]) payload[key] = currentValues[key];
  });
  return payload;
};

// -----------------------------------
// Component
// -----------------------------------
const PartyModal = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = null,
  isViewOnly: isViewOnlyProp = false
}) => {
  initialData = null;
  const createPartyMutation = useCreateParty();
  onSubmit = createPartyMutation.mutateAsync;

  const { theme } = useTheme();
  const [isEditMode, setIsEditMode] = useState(() => (initialData ? !isViewOnlyProp : true));

  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // -----------------------------------
  // Default Values
  // -----------------------------------
  const defaultValues = useMemo(
    () => ({
      name: initialData?.name || "",
      identifier: initialData?.identifier || "",
      type: initialData?.type || "",
      phone: initialData?.phone || "",
      gstNumber: initialData?.gstNumber || "",
      remark: initialData?.remark || "",
      openingBalance: initialData?.openingBalance || 0,
    }),
    [initialData]
  );

  // -----------------------------------
  // React Hook Form
  // -----------------------------------
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty, dirtyFields }
  } = useForm({
    defaultValues,
    resolver: initialData ? yupResolver(partyUpdateSchema) : yupResolver(partyCreateSchema),
    mode: "onSubmit",
    reValidateMode: "onBlur"
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const isDisabled = !isEditMode || isSubmitting || isLoading;

  // -----------------------------------
  // Submit
  // -----------------------------------
  const submitHandler = handleSubmit(
    currentValues => {
      let payload = currentValues;

      if (initialData) {
        payload = extractModifiedFields(currentValues, dirtyFields);

        if (Object.keys(payload).length === 0) {
          toast.info("No changes detected");
          return;
        }
      }

      // Normalize fields
      if ("gstNumber" in payload)
        payload.gstNumber = payload.gstNumber ? payload.gstNumber.toUpperCase() : undefined;

      if ("openingBalance" in payload)
        payload.openingBalance =
          payload.openingBalance === "" || payload.openingBalance == null
            ? undefined
            : parseFloat(payload.openingBalance);

      onSubmit(payload);
      console.log("🚀 ~ PartyModal ~ payload:", payload)

      if (!initialData) {
        reset(defaultValues);
      }

      if (initialData && isEditMode) {
        onCancel();
        setIsEditMode(false);
      }
    },
    err => {
      if (Object.keys(err).length > 0)
        toast.error("Please fix validation errors before submitting.");
      else toast.error("An unexpected error occurred.");
    }
  );

  // -----------------------------------
  // Cancel
  // -----------------------------------
  const handleCancel = useCallback(() => {
    if (initialData && isEditMode && isDirty) {
      openDialog({
        title: "Discard Changes?",
        message: "Are you sure you want to discard your changes?",
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
        message: "You have unsaved changes. Exit edit mode?",
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

  // -----------------------------------
  // UI
  // -----------------------------------
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
                  className={`p-2 ${theme.text.primary} ${theme.hover} rounded-lg`}
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submitHandler} className="flex-1 flex flex-col overflow-y-auto">
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <TextField
                name="name"
                label="Party Name"
                icon={Users}
                required
                {...{ register, errors, isEditMode, isDisabled, initialData, theme }}
              />

              <TextField
                name="identifier"
                label="Identifier"
                icon={MapPin}
                required
                {...{ register, errors, isEditMode, isDisabled, initialData, theme }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  name="type"
                  label="Party Type"
                  icon={UserCheck}
                  options={PARTY_TYPE_OPTIONS}
                  required
                  {...{ register, errors, isEditMode, isDisabled, initialData, theme }}
                />
                <TextField
                  name="phone"
                  label="Phone"
                  icon={Phone}
                  required
                  type="tel"
                  inputProps={{ maxLength: 10 }}
                  {...{ register, errors, isEditMode, isDisabled, initialData, theme }}
                />
              </div>

              <TextField
                name="gstNumber"
                label="GST Number"
                icon={Hash}
                inputProps={{ maxLength: 15, style: { textTransform: "uppercase" } }}
                {...{ register, errors, isEditMode, isDisabled, initialData, theme }}
              />

              <TextAreaField
                name="remark"
                label="Remark"
                icon={FileText}
                {...{ register, errors, isEditMode, isDisabled, initialData, theme }}
              />

              <div className={`pt-6 mt-6 border-t-4 ${theme.border}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    name="openingBalance"
                    label="Opening Balance"
                    icon={CreditCard}
                    type="number"
                    required
                    {...{ register, errors, isEditMode, isDisabled, initialData, theme }}
                  />

                  <TextField
                    name="currentBalance"
                    label="Current Balance"
                    defaultValue={initialData ? initialData.currentBalance : 0}
                    icon={DollarSign}
                    type="number"
                    readOnly
                    isDisabled
                    {...{ theme }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`flex gap-3 p-6 border-t ${theme.border}`}>
              <button
                type="button"
                onClick={handleCancel}
                className={`flex-1 px-4 py-3 ${theme.bg} border ${theme.border} rounded-xl`}
              >
                Cancel
              </button>

              {(isEditMode || !initialData) && (
                <button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r ${theme.accentFrom} ${theme.accentTo} ${theme.text.primary}`}
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

      {dialogConfig.isOpen && <ConfirmationModal {...dialogConfig} onCancel={closeDialog} />}
    </>
  );
};

export default PartyModal;
