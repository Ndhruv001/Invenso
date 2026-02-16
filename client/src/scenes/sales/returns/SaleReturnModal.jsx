import React, { useMemo, useEffect, useState, useCallback } from "react";
import { Save, X, FileText, Trash2, Edit3, AlertCircle } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  saleReturnCreateSchema,
  saleReturnUpdateSchema
} from "@/validations/saleReturnValidations";

import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { PAYMENT_MODE_OPTIONS } from "@/constants/PAYMENT_MODES";
import { toast } from "react-toastify";
import { debounce } from "@/lib/helpers/debounce";
import { usePartySuggestions } from "@/hooks/useParties";
import { formatDate, formatCurrency } from "@/lib/helpers/formatters";
import { useSaleSuggestionsByPartyId } from "@/hooks/useSales";

function calculateSaleReturnTotals(items = [], paidAmount = 0) {
  let totalTaxableAmount = 0;
  let totalGstAmount = 0;

  items.forEach(item => {
    const quantity = Number(item.quantity || 0);
    const pricePerUnit = Number(item.pricePerUnit || 0);
    const gstRate = Number(item.gstRate || 0);

    const taxableAmount = quantity * pricePerUnit;
    const gstAmount = (taxableAmount * gstRate) / 100;

    totalTaxableAmount += taxableAmount;
    totalGstAmount += gstAmount;
  });

  const totalAmount = totalTaxableAmount + totalGstAmount;
  const balanceAmount = totalAmount - Number(paidAmount || 0);

  return {
    totalTaxableAmount: Math.round(totalTaxableAmount),
    totalGstAmount: Math.round(totalGstAmount),
    totalAmount: Math.round(totalAmount),
    balanceAmount: Math.round(balanceAmount)
  };
}

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

function toDateInputValue(isoString) {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/* ----------------------------- COMPONENT ----------------------------- */

const SaleReturnModal = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = null,
  mode = "view",
  setMode = null
}) => {
  const { theme } = useTheme();
  const isLinkedToSale = Boolean(initialData?.saleId);

  /* ----------------------- PARTY INPUT ------------------------ */
  const [partyInputValue, setPartyInputValue] = useState(initialData?.party?.name || "");
  const [partySearchQuery, setPartySearchQuery] = useState("");
  const [partySuggestions, setPartySuggestions] = useState([]);
  const [showPartySuggestions, setShowPartySuggestions] = useState(false);
  const [selectedParty, setSelectedParty] = useState(initialData?.party || null);

  /* -------------------------------- SALE INVOICE INPUT ---------------------- -----*/
  const [selectedSale, setSelectedSale] = useState(initialData?.sale || null);
  const [showSaleSuggestions, setShowSaleSuggestions] = useState(false);

  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  /* ---------------------- DEFAULT VALUES ------------------------- */

  const defaultValues = useMemo(
    () => ({
      partyId: initialData?.partyId ?? "",
      phone: initialData?.party?.phone ?? "",
      date: initialData?.date
        ? toDateInputValue(initialData.date)
        : new Date().toISOString().slice(0, 10),
      saleId: initialData?.saleId ?? "",

      paymentMode: initialData?.paymentMode ?? "NONE",
      paymentReference: initialData?.paymentReference ?? "",
      paidAmount: Number(initialData?.paidAmount ?? 0),
      reason: initialData?.reason ?? "",
      totalAmount: Number(initialData?.totalAmount ?? 0),
      totalTaxableAmount: Number(initialData?.totalTaxableAmount ?? 0),
      totalGstAmount: Number(initialData?.totalGstAmount ?? 0),

      items: initialData?.saleReturnItems?.map(item => ({
        // --- identity / relations ---
        id: item.id,
        saleReturnId: item.saleReturnId,
        productId: Number(item.productId),

        // --- rich product object (used for display only) ---
        product: item.product ?? null,

        // --- editable fields ---
        quantity: Number(item.quantity),
        pricePerUnit: Number(item.pricePerUnit),
        gstRate: Number(item.gstRate),
        gstAmount: Number(item.gstAmount),
        taxableAmount: Number(item.taxableAmount),
        amount: Number(item.amount)
      })) ?? [
        {
          id: null,
          saleReturnId: null,
          productId: "",
          product: null,
          quantity: 1,
          pricePerUnit: 0,
          gstRate: 0,
          gstAmount: 0,
          taxableAmount: 0,
          amount: 0
        }
      ]
    }),
    [initialData]
  );

  /* -------------------------- FORM -------------------------- */

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isDirty, isSubmitting, dirtyFields }
  } = useForm({
    defaultValues,
    resolver: yupResolver(initialData ? saleReturnUpdateSchema : saleReturnCreateSchema),
    mode: "onSubmit"
  });

  /* --------------------- WATCHERS ----------------------------- */

  const watchedItems = useWatch({
    control,
    name: "items"
  });
  const watchedpaidAmount = watch("paidAmount");
  const watchedPartyId = watch("partyId");
  const watchedSaleId = watch("saleId");

  const { data: salesByParty = [] } = useSaleSuggestionsByPartyId(watchedPartyId, {
    enabled: !!watchedPartyId && !initialData
  });

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

  useEffect(() => {
    if (watchedSaleId) {
      setShowPartySuggestions(false);
    }
  }, [watchedSaleId]);

  /* ---------------------- FIELD ARRAY ------------------------- */

  const {
    fields: saleItemFields,
    append: appendSaleItem,
    remove: removeSaleItemByIndex,
    replace
  } = useFieldArray({
    control,
    name: "items"
  });

  /* ------------------------ RESET ----------------------------- */

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  /* -------------------- CALCULATIONS -------------------------- */

  const totals = useMemo(() => {
    return calculateSaleReturnTotals(watchedItems, watchedpaidAmount);
  }, [watchedItems, watchedpaidAmount]);

  const calculatedItems = useMemo(() => {
    return watchedItems.map(item => {
      const taxableAmount = item.quantity * item.pricePerUnit;
      const gstAmount = taxableAmount * (item.gstRate / 100);
      const amount = taxableAmount + gstAmount;

      return {
        ...item,
        taxableAmount: Math.round(taxableAmount),
        gstAmount: Math.round(gstAmount),
        amount: Math.round(amount)
      };
    });
  }, [watchedItems]);

  /* -------------------- ITEMS ------------------------------- */

  const handleAddItem = useCallback(() => {
    appendSaleItem({
      productId: "",
      quantity: 1,
      pricePerUnit: 0,
      gstRate: 0
    });
  }, [appendSaleItem]);

  const handleRemoveItem = useCallback(
    index => {
      if (saleItemFields.length > 1) {
        removeSaleItemByIndex(index);
      }
    },
    [saleItemFields.length, removeSaleItemByIndex]
  );

  const handleSelectSale = sale => {
    if (!sale || initialData) return;

    if (!Array.isArray(sale.saleItems)) {
      console.error("❌ saleItems missing", sale);
      return;
    }

    /* ------------------ FORM IDENTITY ------------------ */

    setValue("saleId", sale.id, { shouldDirty: true });
    setValue("partyId", sale.partyId);
    setValue("paymentMode", "NONE");
    setValue("paidAmount", 0);

    // UI-only state
    setSelectedParty(sale.party);

    /* ------------------ HARD RESET ITEMS ------------------ */

    replace([]); // 🔥 force clear first

    replace(
      sale.saleItems.map(item => {
        const quantity = Number(item.quantity || 0);
        const pricePerUnit = Number(item.pricePerUnit || 0);
        const gstRate = Number(item.gstRate || 0);

        const taxableAmount = quantity * pricePerUnit;
        const gstAmount = (taxableAmount * gstRate) / 100;
        const amount = taxableAmount + gstAmount;

        return {
          productId: item.productId,
          product: item.product, // display only

          quantity,
          maxQuantity: quantity, // 🔒 limit return qty
          pricePerUnit,
          gstRate,

          taxableAmount: Math.round(taxableAmount),
          gstAmount: Math.round(gstAmount),
          amount: Math.round(amount)
        };
      })
    );
  };

  const resetPurchaseContext = () => {
    // purchase identity
    setValue("purchaseId", null);
    setValue("purchase", null);

    // UI state
    setSelectedSale(null);
    setShowSaleSuggestions(false);

    // items
    replace([]); // 🔥 clears RHF items array safely

    // optional dependent fields
    setValue("paidAmount", 0);
    setValue("paymentMode", "NONE");
  };

  /* -------------------- SUBMIT ------------------------------- */

  const submitHandler = handleSubmit(
    values => {
      let payload = values;
      if (initialData) {
        payload = extractModifiedFields(values, dirtyFields);
      }
      payload = {
        ...payload,
        items: calculatedItems,
        totalTaxableAmount: totals.totalTaxableAmount,
        totalGstAmount: totals.totalGstAmount,
        totalAmount: totals.totalAmount
      };
      onSubmit(payload);
      console.log("🚀 ~ SaleReturnModal ~ payload:", payload);

      if (!initialData) {
        reset(defaultValues);
      }

      if (initialData && mode === "edit") {
        onCancel();
        setMode(null);
      }
    },
    error => {
      console.log("Validation Errors:", error);
      toast.error("Please fix validation errors before submitting.");
    }
  );

  /* -------------------- CANCEL ------------------------------- */

  const handleCancel = useCallback(() => {
    if (initialData && mode === "edit" && isDirty) {
      openDialog({
        title: "Discard changes?",
        message: "All unsaved changes will be lost.",
        onConfirm: () => {
          reset(defaultValues);
          onCancel();
          setMode(null);
        }
      });
    } else {
      reset(defaultValues);
      onCancel();
    }
  }, [initialData, mode, setMode, isDirty, reset, defaultValues, onCancel, openDialog]);

  // Toggle edit mode with confirmation if dirty
  const handleToggleEditMode = useCallback(() => {
    if (mode === "edit" && isDirty) {
      openDialog({
        title: "Discard Changes?",
        message: "You have unsaved changes. Do you want to discard them and exit edit mode?",
        onConfirm: async () => {
          reset(defaultValues);
          setMode(null);
        }
      });
    } else {
      setMode(prev => prev === "edit" ? "view" : "edit");
    }
  }, [mode, setMode, isDirty, reset, defaultValues, openDialog]);

  // Disabled state
  const isDisabled = mode === "view" || isSubmitting || isLoading;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex saleItems-center justify-center p-4 z-50">
        <div
          className={`${theme.card} rounded-2xl shadow-2xl w-full max-w-7xl border ${theme.border} max-h-[95vh] flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className={`flex saleItems-center justify-between p-4 border-b ${theme.border}`}>
            <div className="flex saleItems-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${theme.accent}`}>
                <FileText className={`w-5 h-5 ${theme.text.primary}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${theme.text.primary}`}>
                  {initialData
                    ? mode === "edit"
                      ? "Edit Sale Return"
                      : "View Sale Return"
                    : "Create Sale Return"}
                </h2>
                <p className={`text-sm ${theme.text.muted}`}>
                  {mode === "view" && initialData
                    ? "Sale return details (read-only)"
                    : "Fill in the sale return details"}
                </p>
              </div>
            </div>
            <div className="flex saleItems-center gap-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Party Name */}
                  <div className="relative">
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                      Party Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={partyInputValue}
                      disabled={isDisabled || isLinkedToSale}
                      onChange={e => {
                        const value = e.target.value;

                        if (selectedParty) {
                          setSelectedParty(null);
                          setValue("partyId", null, { shouldDirty: true });
                          resetPurchaseContext();
                        }

                        setPartyInputValue(value);
                        debouncedPartySearch(value);
                      }}
                      className={`w-full px-3 py-2  text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none ${theme.bg}`}
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
                              resetPurchaseContext();
                              setShowPartySuggestions(false);
                            }}
                          >
                            {party.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                      Phone No.
                    </label>
                    <input
                      type="tel"
                      value={selectedParty?.phone || ""}
                      disabled={true}
                      className={`w-full px-3 py-2 cursor-not-allowed text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none ${theme.bg}`}
                      placeholder="Phone number"
                    />
                  </div>

                  {/* Sale Invoice */}
                  <div className="relative">
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                      Sale Invoice <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      disabled={isDisabled || isLinkedToSale || !watch("partyId")}
                      value={selectedSale?.invoiceNumber || ""}
                      onFocus={() => {
                        if (watch("partyId")) {
                          setShowSaleSuggestions(true);
                        }
                      }}
                      readOnly
                      placeholder="Select sale invoice"
                      className={`w-full px-3 py-2 text-sm border ${theme.border} rounded-lg ${theme.bg}`}
                    />

                    {showSaleSuggestions && salesByParty.length > 0 && (
                      <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
                        {salesByParty.map(sale => (
                          <li
                            key={sale.id}
                            onClick={() => {
                              setSelectedSale(sale);
                              setShowSaleSuggestions(false);
                              handleSelectSale(sale);
                            }}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-50 transition"
                          >
                            {/* Row 1: Invoice */}
                            <div className="text-sm font-medium text-gray-800">
                              Sale Invoice #{sale.invoiceNumber}
                            </div>

                            {/* Row 2: Meta */}
                            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                              <span>{formatDate(sale.date)}</span>
                              <span className="font-semibold text-gray-700">
                                ₹{formatCurrency(sale.totalAmount)}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Return Date */}
                  <div>
                    <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                      Return Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register("date")}
                      disabled={isDisabled}
                      className={`w-full px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none ${theme.bg}`}
                    />
                    {errors.date && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.date.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* saleItems Table */}
                <div className="space-y-3">
                  <h3 className={`text-lg font-semibold ${theme.text.primary}`}>saleItems</h3>

                  <div className={`overflow-x-auto border ${theme.border} rounded-lg`}>
                    <table className="w-full min-w-max table-fixed" style={{ minWidth: "1200px" }}>
                      <thead>
                        <tr className={theme.tableHeader}>
                          <th className="px-2 py-2 w-12">SN</th>
                          <th className="px-3 py-2">Item</th>
                          <th className="px-2 py-2 w-20">Qty</th>
                          <th className="px-2 py-2 w-24">Unit</th>
                          <th className="px-2 py-2 w-28">Price</th>
                          <th className="px-2 py-2 w-32">GST</th>
                          <th className="px-2 py-2 w-32 text-right">Amount</th>
                          {(mode === "edit" || !initialData) && (
                            <th className="px-2 py-2 w-16">Action</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {saleItemFields.map((field, index) => {
                          const item = watchedItems[index] || {};

                          const qty = Number(item.quantity || 0);
                          const price = Number(item.pricePerUnit || 0);
                          const gstRate = Number(item.gstRate || 0);

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

                              {/* Item Name (read from product) */}
                              <td className={`border ${theme.border} px-2 py-2`}>
                                <input
                                  type="text"
                                  value={item.product?.name || ""}
                                  disabled
                                  className="w-full px-2 py-1 text-sm border-0 outline-none bg-transparent"
                                />
                              </td>

                              {/* Quantity */}
                              <td className={`border ${theme.border} px-2 py-2`}>
                                <input
                                  type="number"
                                  {...register(`items.${index}.quantity`, {
                                    min: 0,
                                    max: item.maxQuantity
                                  })}
                                  disabled={isDisabled}
                                  className={`w-full px-2 py-1 text-sm border-0 outline-none bg-transparent ${theme.text.primary}`}
                                />
                              </td>

                              {/* Unit (from product, read-only) */}
                              <td className={`border ${theme.border} px-2 py-2`}>
                                <input
                                  value={item.product?.unit || ""}
                                  disabled
                                  className={`w-full px-2 py-1 cursor-not-allowed text-sm border-0 outline-none bg-transparent ${theme.text.primary}`}
                                />
                              </td>

                              {/* Price per unit */}
                              <td className={`border ${theme.border} px-2 py-2`}>
                                <input
                                  type="number"
                                  value={item.pricePerUnit || 0}
                                  disabled
                                  className={`w-full px-2 py-1 text-sm border-0 outline-none bg-transparent ${theme.text.primary}`}
                                />
                              </td>

                              {/* GST */}
                              <td className={`border ${theme.border} px-1 py-2`}>
                                <div className="grid grid-cols-2 gap-1 items-center">
                                  <input
                                    type="number"
                                    disabled
                                    value={item.gstRate || 0}
                                    className={`w-full px-1 py-1 text-xs border-0 outline-none bg-transparent ${theme.text.primary}`}
                                  />

                                  <div
                                    className={`px-1 py-1 text-xs text-right font-medium ${theme.text.primary}`}
                                  >
                                    ₹{Math.round(gstAmount).toFixed(2)}
                                  </div>
                                </div>
                              </td>

                              {/* Total */}
                              <td
                                className={`border cursor-not-allowed ${theme.border} px-2 py-2 text-right text-sm font-medium ${theme.text.primary}`}
                              >
                                ₹{Math.round(totalAmount).toFixed(2)}
                              </td>

                              {/* Action */}
                              {(mode === "edit" || !initialData) && (
                                <td className={`border ${theme.border} px-2 py-2 text-center`}>
                                  {saleItemFields.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(index)}
                                      className="p-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                        {/* 👇 ADD-ITEM ROW */}
                        {(mode === "edit" || !initialData) && (
                          <tr className={theme.tableRow}>
                            {/* SN */}
                            <td className={`border ${theme.border} px-2 py-2 text-center text-sm`}>
                              +
                            </td>

                            {/* Item column → Add button */}
                            <td className={`border ${theme.border} px-2 py-2`}>
                              <button
                                type="button"
                                onClick={handleAddItem}
                                disabled
                                className={`inline-flex items-center border font-bold text-sm gap-1 px-3 py-1 cursor-not-allowed rounded-md ${theme.text.muted} hover:${theme.text.primary} transition`}
                              >
                                + Add Item
                              </button>
                            </td>

                            {/* Quantity */}
                            <td className={`border ${theme.border} px-2 py-2`} />

                            {/* Unit */}
                            <td className={`border ${theme.border} px-2 py-2`} />

                            {/* Price */}
                            <td className={`border ${theme.border} px-2 py-2`} />

                            {/* GST */}
                            <td className={`border ${theme.border} px-2 py-2`} />

                            {/* Total */}
                            <td className={`border ${theme.border} px-2 py-2`} />

                            {/* Action */}
                            {(mode === "edit" || !initialData) && (
                              <td className={`border ${theme.border} px-2 py-2`} />
                            )}
                          </tr>
                        )}
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
                        Payment Mode
                      </label>
                      <select
                        {...register("paymentMode")}
                        disabled={isDisabled}
                        className={`w-48 px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none ${theme.bg}`}
                      >
                        {PAYMENT_MODE_OPTIONS.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                        Payment Reference
                      </label>
                      <input
                        type="text"
                        {...register("paymentReference")}
                        disabled={isDisabled}
                        className={`w-48 px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none ${theme.bg}`}
                        placeholder="Payment reference"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                        Reason
                      </label>
                      <textarea
                        {...register("reason")}
                        disabled={isDisabled}
                        rows={3}
                        className={`w-48 px-3 py-2 text-sm border ${theme.border} rounded-lg focus:border-blue-500 outline-none resize-none ${theme.bg}`}
                        placeholder="Additional reason"
                      />
                    </div>
                  </div>

                  {/* Right Side - Totals */}
                  <div className="w-full max-w-sm ml-auto space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Amount</span>
                      <span className="font-semibold cursor-not-allowed">
                        ₹{totals.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span>Paid</span>
                      <input
                        type="number"
                        {...register("paidAmount")}
                        disabled={isDisabled}
                        className="w-24 px-2 py-1 text-lg font-bold text-right"
                      />
                    </div>

                    <div className="flex justify-between border-t pt-2 font-semibold cursor-not-allowed">
                      <span>Balance</span>
                      <span>
                        ₹{(totals.totalAmount - Number(watch("paidAmount") || 0)).toFixed(2)}
                      </span>
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
              {(mode === "edit" || !initialData) && (
                <button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className={`flex-1 flex saleItems-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r ${theme.accentFrom} ${theme.accentTo} ${theme.text.primary} transition-all ${
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
                      : "Create Purchase Return"}
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

export default SaleReturnModal;
