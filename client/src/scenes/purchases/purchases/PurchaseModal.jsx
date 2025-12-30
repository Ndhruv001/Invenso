import React, { useMemo, useEffect, useState, useCallback } from "react";
import { Save, X, FileText, Plus, Trash2, Edit3, AlertCircle } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import purchaseSchema from "@/validations/purchaseSchema";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { formatDate } from "@/lib/helpers/formatters";
import { toast } from "react-toastify";

const PARTIES = [
  { id: "1", name: "Party A", phone: "1234567890" },
  { id: "2", name: "Party B", phone: "0987654321" }
];
const CATEGORIES = [
  { id: "1", name: "Category 1" },
  { id: "2", name: "Category 2" }
];
const SIZES = [
  { id: "1", name: "Small" },
  { id: "2", name: "Medium" },
  { id: "3", name: "Large" }
];
const UNITS = [
  { id: "1", name: "Pcs" },
  { id: "2", name: "Kg" },
  { id: "3", name: "Meter" }
];
const GST_RATES = [
  { id: "0", name: "0%" },
  { id: "5", name: "5%" },
  { id: "12", name: "12%" },
  { id: "18", name: "18%" },
  { id: "28", name: "28%" }
];
const PAYMENT_TYPES = [
  { id: "cash", name: "Cash" },
  { id: "card", name: "Card" },
  { id: "upi", name: "UPI" },
  { id: "bank", name: "Bank Transfer" }
];

const PurchaseModal = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = null,
  isViewOnly: isViewOnlyProp = false
}) => {
  console.log("🚀 ~ PurchaseModal ~ initialData:", initialData);
  const { theme } = useTheme();

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(() => (initialData ? !isViewOnlyProp : true));

  // Confirmation dialog hook
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // Memoize default values
  const defaultValues = useMemo(() => {
    return {
      partyName: initialData?.party?.name || "",
      phone: initialData?.party?.phone || "",
      billingAddress: initialData?.billingAddress || "",
      shippingAddress: initialData?.shippingAddress || "",
      invoiceNumber: initialData?.invoiceNumber || "",
      invoiceDate: formatDate(initialData?.date) || "",
      purchaseItems: initialData?.purchaseItems || [],
      paymentMode: initialData?.paymentMode || "",
      paymentReference: initialData?.paymentReference || "",
      remarks: initialData?.remarks || "",
      totalAmount: initialData?.totalAmount ?? 0,
      paidAmount: initialData?.paidAmount ?? 0
    };
  }, [initialData]);

  // React Hook Form setup with useFieldArray for dynamic purchaseItems
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting, isDirty }
  } = useForm({
    defaultValues,
    resolver: yupResolver(purchaseSchema),
    mode: "onSubmit",
    reValidateMode: "onBlur"
  });

  // Field array for purchaseItems management
  const { fields, append, remove } = useFieldArray({
    control,
    name: "purchaseItems"
  });

  // Reset form when defaultValues change
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // Watch all form values for calculations
  const watchedpurchaseItems = watch("purchaseItems");
  const watchedRoundOff = watch("roundOff");
  const watchedPaymentAmount = watch("paymentAmount");

  // Disabled state
  const isDisabled = !isEditMode || isSubmitting || isLoading;

  // Calculate totals (memoized for performance)
  const calculations = useMemo(() => {
    let subtotal = 0;
    let totalGst = 0;
    let totalQty = 0;

    watchedpurchaseItems?.forEach(item => {
      const qty = parseFloat(item?.qty || 0);
      const price = parseFloat(item?.pricePerUnit || 0);
      const gstRate = parseFloat(item?.gstPercentage || 0);

      const itemTotal = qty * price;
      const gstAmount = (itemTotal * gstRate) / 100;

      subtotal += itemTotal;
      totalGst += gstAmount;
      totalQty += qty;
    });

    const grandTotal = subtotal + totalGst;
    const roundOff = parseFloat(watchedRoundOff || 0);
    const finalTotal = grandTotal + roundOff;
    const paymentAmount = parseFloat(watchedPaymentAmount || 0);
    const balance = finalTotal - paymentAmount;

    return {
      subtotal,
      totalGst,
      totalQty,
      grandTotal,
      roundOff,
      finalTotal,
      paymentAmount,
      balance
    };
  }, [watchedpurchaseItems, watchedRoundOff, watchedPaymentAmount]);

  // Handle party selection
  const handlePartyChange = useCallback(
    partyId => {
      const party = PARTIES.find(p => p.id === partyId);
      setValue("partyName", partyId);
      setValue("phoneNo", party ? party.phone : "");
    },
    [setValue]
  );

  // Add new item
  const addNewItem = useCallback(() => {
    append({
      item: "",
      hsn: "",
      category: "",
      size: "",
      qty: 1,
      unit: "",
      pricePerUnit: 0,
      gstPercentage: "18"
    });
  }, [append]);

  // Remove item
  const removeItem = useCallback(
    index => {
      if (fields.length > 1) {
        remove(index);
      }
    },
    [fields.length, remove]
  );

  // Submit handler
  const submitHandler = handleSubmit(
    values => {
      const formattedData = {
        ...values,
        purchaseItems: values.purchaseItems.map((item, index) => {
          const qty = parseFloat(item.qty || 0);
          const price = parseFloat(item.pricePerUnit || 0);
          const gstRate = parseFloat(item.gstPercentage || 0);
          const itemTotal = qty * price;
          const gstAmount = (itemTotal * gstRate) / 100;

          return {
            ...item,
            sn: index + 1,
            qty,
            pricePerUnit: price,
            gstAmount,
            amount: itemTotal + gstAmount
          };
        }),
        ...calculations
      };

      onSubmit(formattedData);

      if (!initialData) {
        reset(defaultValues);
      }
      if (initialData && isEditMode) {
        onCancel();
        setIsEditMode(false);
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

  // Handle cancel with confirmation if dirty
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

  // Toggle edit mode with confirmation if dirty
  const handleToggleEditMode = useCallback(() => {
    if (isEditMode && isDirty) {
      openDialog({
        title: "Discard Changes?",
        message: "You have unsaved changes. Do you want to discard them and exit edit mode?",
        onConfirm: async () => {
          reset(defaultValues);
          setIsEditMode(false);
        }
      });
    } else {
      setIsEditMode(prev => !prev);
    }
  }, [isEditMode, isDirty, reset, defaultValues, openDialog]);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex purchaseItems-center justify-center p-4 z-50">
        <div
          className={`${theme.card} rounded-2xl shadow-2xl w-full max-w-7xl border ${theme.border} max-h-[95vh] flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className={`flex purchaseItems-center justify-between p-4 border-b ${theme.border}`}>
            <div className="flex purchaseItems-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.accent}`}>
                <FileText className={`w-5 h-5 ${theme.text.primary}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>
                  {initialData ? (isEditMode ? "Edit Invoice" : "View Invoice") : "Create Invoice"}
                </h2>
                <p className={`text-sm ${theme.text.muted}`}>
                  {!isEditMode && initialData
                    ? "Invoice details (read-only)"
                    : "Fill in the invoice details"}
                </p>
              </div>
            </div>
            <div className="flex purchaseItems-center gap-2">
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

          {/* Form Content */}
          <form
            onSubmit={submitHandler}
            className="flex-1 flex flex-col overflow-hidden"
            noValidate
            spellCheck={false}
          >
            <div className="overflow-y-auto flex-1 p-4">
              <div className="space-y-4">
                {/* Top Section - Party Details and Invoice Info */}
                <div className="flex justify-between gap-6">
                  {/* Left Side - Party Details */}
                  <div className="flex-1 max-w-lg space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                          Party Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register("partyName")}
                          onChange={e => handlePartyChange(e.target.value)}
                          disabled={isDisabled}
                          className={`w-full px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none ${theme.bg}`}
                        >
                          <option value="">Select Party</option>
                          {PARTIES.map(party => (
                            <option key={party.id} value={party.id}>
                              {party.name}
                            </option>
                          ))}
                        </select>
                        {errors.partyName && (
                          <p className="mt-1 text-xs text-red-600 flex purchaseItems-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.partyName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                          Phone No.
                        </label>
                        <input
                          type="tel"
                          {...register("phoneNo")}
                          disabled={isDisabled}
                          className={`w-full px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none ${theme.bg}`}
                          placeholder="Phone number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                          Billing Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          {...register("billingAddress")}
                          disabled={isDisabled}
                          rows={3}
                          className={`w-full px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none resize-none ${theme.bg}`}
                          placeholder="Billing address"
                        />
                        {errors.billingAddress && (
                          <p className="mt-1 text-xs text-red-600 flex purchaseItems-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.billingAddress.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                          Shipping Address
                        </label>
                        <textarea
                          {...register("shippingAddress")}
                          disabled={isDisabled}
                          rows={3}
                          className={`w-full px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none resize-none ${theme.bg}`}
                          placeholder="Shipping address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Invoice Details */}
                  <div className="w-60 space-y-3">
                    <div>
                      <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                        Invoice Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register("invoiceNumber")}
                        disabled={isDisabled}
                        className={`w-full px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none ${theme.bg}`}
                        placeholder="INV-001"
                      />
                      {errors.invoiceNumber && (
                        <p className="mt-1 text-xs text-red-600 flex purchaseItems-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.invoiceNumber.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                        Invoice Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        {...register("invoiceDate")}
                        disabled={isDisabled}
                        className={`w-full px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none ${theme.bg}`}
                      />
                      {errors.invoiceDate && (
                        <p className="mt-1 text-xs text-red-600 flex purchaseItems-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.invoiceDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* purchaseItems Table */}
                <div className="space-y-3">
                  <h3 className={`text-lg font-semibold ${theme.text.primary}`}>purchaseItems</h3>

                  <div className={`overflow-x-auto border ${theme.border} rounded-lg`}>
                    <table className="w-full min-w-max table-fixed" style={{ minWidth: "1200px" }}>
                      <thead>
                        <tr className={theme.tableHeader}>
                          <th
                            className={`border ${theme.border} px-2 py-2 text-sm font-medium ${theme.text.secondary}`}
                            style={{ width: "70px" }}
                          >
                            SN.
                          </th>
                          <th
                            className={`border ${theme.border} px-3 py-2 text-sm font-medium ${theme.text.secondary}`}
                            style={{ width: "300px" }}
                          >
                            Item
                          </th>
                          <th
                            className={`border ${theme.border} px-2 py-2 text-sm font-medium ${theme.text.secondary}`}
                            style={{ width: "100px" }}
                          >
                            HSN
                          </th>
                          <th
                            className={`border ${theme.border} px-2 py-2 text-sm font-medium ${theme.text.secondary}`}
                            style={{ width: "135px" }}
                          >
                            Category
                          </th>
                          <th
                            className={`border ${theme.border} px-2 py-2 text-sm font-medium ${theme.text.secondary}`}
                            style={{ width: "110px" }}
                          >
                            Size
                          </th>
                          <th
                            className={`border ${theme.border} px-2 py-2 text-sm font-medium ${theme.text.secondary}`}
                            style={{ width: "80px" }}
                          >
                            Qty
                          </th>
                          <th
                            className={`border ${theme.border} px-2 py-2 text-sm font-medium ${theme.text.secondary}`}
                            style={{ width: "100px" }}
                          >
                            Unit
                          </th>
                          <th
                            className={`border ${theme.border} px-2 py-2 text-sm font-medium ${theme.text.secondary}`}
                            style={{ width: "120px" }}
                          >
                            Price/Unit
                          </th>
                          <th
                            className={`border ${theme.border} px-2 py-2 text-sm font-medium ${theme.text.secondary}`}
                            style={{ width: "150px" }}
                          >
                            <div>GST</div>
                            <div className="grid grid-cols-2 gap-1 mt-1">
                              <div className="text-xs">%</div>
                              <div className="text-xs">Amount</div>
                            </div>
                          </th>
                          <th
                            className={`border ${theme.border} px-2 py-2 text-sm font-medium ${theme.text.secondary}`}
                            style={{ width: "130px" }}
                          >
                            Amount
                          </th>
                          {(isEditMode || !initialData) && (
                            <th
                              className={`border ${theme.border} px-2 py-2 text-sm font-medium ${theme.text.secondary}`}
                              style={{ width: "70px" }}
                            >
                              Action
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map((field, index) => {
                          const item = watchedpurchaseItems[index] || {};
                          const qty = parseFloat(item?.qty || 0);
                          const price = parseFloat(item?.pricePerUnit || 0);
                          const gstRate = parseFloat(item?.gstPercentage || 0);
                          const itemTotal = qty * price;
                          const gstAmount = (itemTotal * gstRate) / 100;
                          const totalAmount = itemTotal + gstAmount;

                          return (
                            <tr key={field.id} className={theme.tableRow}>
                              <td
                                className={`border ${theme.border} px-2 py-2 text-center text-sm`}
                              >
                                {index + 1}
                              </td>
                              <td className={`border ${theme.border} px-2 py-2`}>
                                <input
                                  {...register(`purchaseItems.${index}.item`)}
                                  disabled={isDisabled}
                                  className={`w-full px-2 py-1 text-sm border-0 outline-none bg-transparent ${theme.text.primary}`}
                                  placeholder="Item name"
                                />
                                {errors?.purchaseItems?.[index]?.item && (
                                  <p className="text-xs text-red-600 mt-1">Required</p>
                                )}
                              </td>
                              <td className={`border ${theme.border} px-2 py-2`}>
                                <input
                                  {...register(`purchaseItems.${index}.hsn`)}
                                  disabled={isDisabled}
                                  className={`w-full px-2 py-1 text-sm border-0 outline-none bg-transparent ${theme.text.primary}`}
                                  placeholder="HSN"
                                />
                              </td>
                              <td className={`border ${theme.border} px-2 py-2`}>
                                <select
                                  {...register(`purchaseItems.${index}.category`)}
                                  disabled={isDisabled}
                                  className={`w-full px-2 py-1 text-sm border-0 outline-none bg-transparent ${theme.text.primary}`}
                                >
                                  <option value="">None</option>
                                  {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className={`border ${theme.border} px-2 py-2`}>
                                <select
                                  {...register(`purchaseItems.${index}.size`)}
                                  disabled={isDisabled}
                                  className={`w-full px-2 py-1 text-sm border-0 outline-none bg-transparent ${theme.text.primary}`}
                                >
                                  <option value="">None</option>
                                  {SIZES.map(size => (
                                    <option key={size.id} value={size.id}>
                                      {size.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className={`border ${theme.border} px-2 py-2`}>
                                <input
                                  type="number"
                                  {...register(`purchaseItems.${index}.qty`)}
                                  disabled={isDisabled}
                                  className={`w-full px-2 py-1 text-sm border-0 outline-none bg-transparent ${theme.text.primary}`}
                                  min="1"
                                  step="1"
                                />
                              </td>
                              <td className={`border ${theme.border} px-2 py-2`}>
                                <select
                                  {...register(`purchaseItems.${index}.unit`)}
                                  disabled={isDisabled}
                                  className={`w-full px-2 py-1 text-sm border-0 outline-none bg-transparent ${theme.text.primary}`}
                                >
                                  <option value="">None</option>
                                  {UNITS.map(unit => (
                                    <option key={unit.id} value={unit.name}>
                                      {unit.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className={`border ${theme.border} px-2 py-2`}>
                                <input
                                  type="number"
                                  {...register(`purchaseItems.${index}.pricePerUnit`)}
                                  disabled={isDisabled}
                                  className={`w-full px-2 py-1 text-sm border-0 outline-none bg-transparent ${theme.text.primary}`}
                                  min="0"
                                  step="0.01"
                                />
                              </td>
                              <td className={`border ${theme.border} px-1 py-2`}>
                                <div className="grid grid-cols-2 gap-1">
                                  <select
                                    {...register(`purchaseItems.${index}.gstPercentage`)}
                                    disabled={isDisabled}
                                    className={`w-full px-1 py-1 text-xs border-0 outline-none bg-transparent ${theme.text.primary}`}
                                  >
                                    {GST_RATES.map(rate => (
                                      <option key={rate.id} value={rate.id}>
                                        {rate.name}
                                      </option>
                                    ))}
                                  </select>
                                  <div
                                    className={`px-1 py-1 text-xs text-right ${theme.text.primary}`}
                                  >
                                    ₹{gstAmount.toFixed(2)}
                                  </div>
                                </div>
                              </td>
                              <td
                                className={`border ${theme.border} px-2 py-2 text-right text-sm font-medium ${theme.text.primary}`}
                              >
                                ₹{totalAmount.toFixed(2)}
                              </td>
                              {(isEditMode || !initialData) && (
                                <td className={`border ${theme.border} px-2 py-2 text-center`}>
                                  {fields.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeItem(index)}
                                      className="p-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                      title="Remove item"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}

                        {/* Summary Row */}
                        <tr className={`${theme.tableHeader} font-medium`}>
                          <td className={`border ${theme.border} px-2 py-2 text-center text-sm`}>
                            {(isEditMode || !initialData) && (
                              <button
                                type="button"
                                onClick={addNewItem}
                                className="flex purchaseItems-center cursor-pointer gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                title="Add new item"
                              >
                                <Plus className="w-3 h-3" />
                                Add
                              </button>
                            )}
                          </td>
                          <td
                            className={`border ${theme.border} px-2 py-2 text-sm ${theme.text.primary}`}
                          >
                            Total
                          </td>
                          <td className={`border ${theme.border}`}></td>
                          <td className={`border ${theme.border}`}></td>
                          <td className={`border ${theme.border}`}></td>
                          <td
                            className={`border ${theme.border} px-2 py-2 text-center text-sm ${theme.text.primary}`}
                          >
                            {calculations.totalQty}
                          </td>
                          <td className={`border ${theme.border}`}></td>
                          <td className={`border ${theme.border}`}></td>
                          <td
                            className={`border ${theme.border} px-2 py-2 text-right text-sm ${theme.text.primary}`}
                          >
                            ₹{calculations.totalGst.toFixed(2)}
                          </td>
                          <td
                            className={`border ${theme.border} px-2 py-2 text-right text-sm ${theme.text.primary}`}
                          >
                            ₹{calculations.grandTotal.toFixed(2)}
                          </td>
                          {(isEditMode || !initialData) && (
                            <td className={`border ${theme.border}`}></td>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex justify-between gap-4">
                  {/* Left Side - Payment Details */}
                  <div className="flex-1 max-w-md space-y-3">
                    <div>
                      <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                        Payment Type
                      </label>
                      <select
                        {...register("paymentType")}
                        disabled={isDisabled}
                        className={`w-48 px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none ${theme.bg}`}
                      >
                        <option value="">None</option>
                        {PAYMENT_TYPES.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                        Reference
                      </label>
                      <input
                        type="text"
                        {...register("reference")}
                        disabled={isDisabled}
                        className={`w-48 px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none ${theme.bg}`}
                        placeholder="Reference number"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                        Remarks
                      </label>
                      <textarea
                        {...register("remarks")}
                        disabled={isDisabled}
                        rows={3}
                        className={`w-48 px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none resize-none ${theme.bg}`}
                        placeholder="Additional remarks"
                      />
                    </div>
                  </div>

                  {/* Right Side - Totals */}
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between py-1 purchaseItems-center">
                      <span className={`text-sm ${theme.text.secondary}`}>Round Off:</span>
                      <input
                        type="number"
                        {...register("roundOff")}
                        disabled={isDisabled}
                        className={`w-24 px-2 py-1 text-sm border ${theme.border} rounded text-right focus:border-blue-500 outline-none ${theme.bg}`}
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div className={`flex justify-between py-2 border-t ${theme.border}`}>
                      <span className={`text-base font-semibold ${theme.text.primary}`}>
                        Total Amount:
                      </span>
                      <span className={`text-base font-bold ${theme.text.primary}`}>
                        ₹{calculations.finalTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 purchaseItems-center">
                      <span className={`text-sm ${theme.text.secondary}`}>Payment:</span>
                      <input
                        type="number"
                        {...register("paymentAmount")}
                        disabled={isDisabled}
                        className={`w-24 px-2 py-1 text-sm border ${theme.border} rounded text-right focus:border-blue-500 outline-none ${theme.bg}`}
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className={`flex gap-3 p-4 border-t ${theme.border}`}>
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
                  className={`flex-1 flex purchaseItems-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r ${theme.accentFrom} ${theme.accentTo} ${theme.text.primary} transition-all ${
                    isLoading || isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:opacity-90 cursor-pointer"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {isLoading || isSubmitting
                    ? "Saving..."
                    : initialData
                      ? "Save Changes"
                      : "Create Invoice"}
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

export default PurchaseModal;
