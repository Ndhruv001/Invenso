import React, { useMemo, useEffect, useCallback, useState } from "react";
import { Save, X, PackagePlus, Package, FileText, Search } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { stockAdjustmentCreateSchema } from "@/validations/stockAdjustmentValidations";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { TextField, TextAreaField, SelectField } from "@/components/common/FormFields";
import { INVENTORY_LOG_TYPE_OPTIONS } from "@/constants/INVENTORY_LOG_TYPES";
import { useProductSuggestions } from "@/hooks/useProducts"; // ← wire your actual hook
import { toast } from "react-toastify";
import { debounce } from "@/lib/helpers/debounce";

const StockAdjustmentModal = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = null,
  mode = "create",
  setMode = () => {}
}) => {
  const { theme } = useTheme();
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // ── Product search state ──────────────────────────────────────────
  const [productSearchText, setProductSearchText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  // ── Form ──────────────────────────────────────────────────────────
  const defaultValues = useMemo(
    () => ({
      productId: initialData?.productId || "",
      type: initialData?.type || "",
      quantity: initialData?.quantity || "",
      reason: initialData?.reason || ""
    }),
    [initialData]
  );

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm({
    defaultValues,
    resolver: yupResolver(stockAdjustmentCreateSchema),
    mode: "onSubmit",
    reValidateMode: "onBlur"
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const isDisabled = mode === "view" || isSubmitting || isLoading;

  // ── Product suggestions hook ──────────────────────────────────────
  const { data: productSuggestions = [] } = useProductSuggestions(productSearchQuery);

  const debouncedProductSearch = useMemo(
    () =>
      debounce(value => {
        if (!value) {
          setShowProductSuggestions(false);
          setProductSearchQuery("");
          return;
        }
        setProductSearchQuery(value);
        setShowProductSuggestions(true);
      }, 800),
    []
  );

  const handleProductInputChange = e => {
    const value = e.target.value;
    setProductSearchText(value);

    // Clear previously selected product from form
    setSelectedProduct(null);
    setValue("productId", "");

    debouncedProductSearch(value);
  };

  const handleSelectProduct = product => {
    setSelectedProduct(product);
    setProductSearchText(product.name);
    setValue("productId", product.id, { shouldDirty: true, shouldValidate: true });
    setShowProductSuggestions(false);
    setProductSearchQuery("");
  };

  // ── Submit ────────────────────────────────────────────────────────
  const submitHandler = handleSubmit(
    currentFormValues => {
      onSubmit(currentFormValues);
      console.log("🚀 ~ StockAdjustmentModal ~ currentFormValues:", currentFormValues);
      reset(defaultValues);
      setProductSearchText("");
      setSelectedProduct(null);
      onCancel();
    },
    formErrors => {
      if (Object.keys(formErrors).length > 0) {
        toast.error("Please fix validation errors before submitting.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  );

  // ── Cancel ────────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    if (isDirty) {
      openDialog({
        title: "Discard Changes?",
        message: "You have unsaved changes. Are you sure you want to discard them?",
        onConfirm: async () => {
          reset(defaultValues);
          setProductSearchText("");
          setSelectedProduct(null);
          onCancel();
          setMode(null);
        }
      });
    } else {
      reset(defaultValues);
      setProductSearchText("");
      setSelectedProduct(null);
      onCancel();
    }
  }, [isDirty, reset, defaultValues, onCancel, openDialog, setMode]);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div
          className={`${theme.card} rounded-2xl shadow-2xl w-full max-w-xl border ${theme.border} max-h-[90vh] flex flex-col overflow-hidden`}
        >
          {/* ── Header ── */}
          <div className={`flex items-center justify-between p-6 border-b ${theme.border}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.accent}`}>
                <PackagePlus className={`w-5 h-5 ${theme.text.primary}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>
                  Add Stock Adjustment
                </h2>
                <p className={`text-sm ${theme.text.muted}`}>
                  Fill in the stock adjustment details below
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Form ── */}
          <form
            onSubmit={submitHandler}
            className="flex-1 flex flex-col overflow-y-auto"
            noValidate
            spellCheck={false}
          >
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Product Search Field */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-sm font-medium ${theme.text.primary}`}>
                  Product <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${
                      errors.productId ? "border-red-500" : theme.border
                    } ${theme.bg}`}
                  >
                    <Search className={`w-4 h-4 shrink-0 ${theme.text.muted}`} />
                    <input
                      type="text"
                      disabled={isDisabled}
                      value={productSearchText}
                      onChange={handleProductInputChange}
                      onBlur={() => {
                        // slight delay so click on suggestion registers first
                        setTimeout(() => setShowProductSuggestions(false), 150);
                      }}
                      placeholder="Search product by name..."
                      className={`flex-1 bg-transparent outline-none text-sm ${theme.text.primary} placeholder:${theme.text.muted} disabled:opacity-50`}
                    />
                    {selectedProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(null);
                          setProductSearchText("");
                          setValue("productId", "");
                        }}
                        className={`shrink-0 ${theme.text.muted} hover:text-red-500`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Suggestions dropdown */}
                  {showProductSuggestions && productSuggestions.length > 0 && (
                    <ul
                      className={`absolute z-20 mt-1 w-full rounded-xl border ${theme.border} ${theme.card} shadow-lg overflow-hidden`}
                    >
                      {productSuggestions.map(product => (
                        <li
                          key={product.id}
                          onMouseDown={() => handleSelectProduct(product)}
                          className={`px-4 py-2.5 text-sm cursor-pointer ${theme.text.primary} ${theme.hover}`}
                        >
                          {product.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {errors.productId && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.productId.message}</p>
                )}
              </div>

              {/* Inventory Log Type */}
              <SelectField
                name="type"
                label="Adjustment Type"
                placeholder="Select adjustment type"
                icon={PackagePlus}
                required={true}
                options={INVENTORY_LOG_TYPE_OPTIONS}
                errors={errors}
                register={register}
                mode={mode}
                initialData={initialData}
                isDisabled={isDisabled}
                theme={theme}
              />

              {/* Quantity */}
              <TextField
                name="quantity"
                label="Quantity"
                placeholder="Enter quantity"
                type="number"
                icon={Package}
                required={true}
                errors={errors}
                register={register}
                mode={mode}
                initialData={initialData}
                isDisabled={isDisabled}
                theme={theme}
              />

              {/* Reason / Remark */}
              <TextAreaField
                name="reason"
                label="Remark"
                placeholder="Enter a remark or reason for adjustment"
                icon={FileText}
                errors={errors}
                register={register}
                mode={mode}
                initialData={initialData}
                isDisabled={isDisabled}
                theme={theme}
              />
            </div>

            {/* ── Footer ── */}
            <div className={`flex gap-3 p-6 border-t ${theme.border}`}>
              <button
                type="button"
                onClick={handleCancel}
                className={`flex-1 px-4 py-3 ${theme.bg} border ${theme.border} rounded-xl ${theme.hover} cursor-pointer`}
              >
                Cancel
              </button>

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
                {isLoading || isSubmitting ? "Adding..." : "Add Adjustment"}
              </button>
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

export default StockAdjustmentModal;
export { StockAdjustmentModal };
