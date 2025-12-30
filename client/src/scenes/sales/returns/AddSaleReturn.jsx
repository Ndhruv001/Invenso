import React, { useState, useMemo, useEffect } from "react";
import {
  Save,
  X,
  FileText,
  Users,
  Calendar,
  Hash,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Edit3,
  AlertCircle,
  Calculator,
  CreditCard
} from "lucide-react";

// Demo constants
const PARTIES = [
  { id: "party1", name: "ABC Electronics Pvt Ltd", phone: "9876543210" },
  { id: "party2", name: "XYZ Trading Company", phone: "8765432109" },
  { id: "party3", name: "PQR Industries", phone: "7654321098" },
  { id: "party4", name: "LMN Enterprises", phone: "6543210987" }
];

const CATEGORIES = [
  { id: "electronics", name: "Electronics" },
  { id: "clothing", name: "Clothing" },
  { id: "furniture", name: "Furniture" },
  { id: "books", name: "Books" }
];

const SIZES = [
  { id: "small", name: "Small" },
  { id: "medium", name: "Medium" },
  { id: "large", name: "Large" },
  { id: "xl", name: "Extra Large" }
];

const UNITS = [
  { id: "pcs", name: "Pieces" },
  { id: "kg", name: "Kg" },
  { id: "ltr", name: "Liter" },
  { id: "mtr", name: "Meter" }
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
  { id: "bank_transfer", name: "Bank Transfer" },
  { id: "cheque", name: "Cheque" }
];

const AddSaleReturn = ({
  onSubmit = () => {},
  onCancel = () => {},
  isLoading = false,
  initialData = null
}) => {
  const [isEditMode, setIsEditMode] = useState(!initialData);
  const [formData, setFormData] = useState({
    partyName: "",
    phoneNo: "",
    billingAddress: "",
    shippingAddress: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    items: [
      {
        item: "",
        hsn: "",
        category: "",
        size: "",
        qty: 1,
        unit: "",
        pricePerUnit: 0,
        gstPercentage: "18"
      }
    ],
    paymentType: "",
    reference: "",
    remarks: "",
    roundOff: 0,
    paymentAmount: 0
  });
  const [errors, setErrors] = useState({});

  const isDisabled = (!isEditMode && initialData) || isLoading;

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const updateFormField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePartyChange = partyId => {
    const party = PARTIES.find(p => p.id === partyId);
    setFormData(prev => ({
      ...prev,
      partyName: partyId,
      phoneNo: party ? party.phone : ""
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    }));
  };

  const addNewItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item: "",
          hsn: "",
          category: "",
          size: "",
          qty: 1,
          unit: "",
          pricePerUnit: 0,
          gstPercentage: "18"
        }
      ]
    }));
  };

  const removeItem = index => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  // Calculate totals
  const calculations = useMemo(() => {
    let subtotal = 0;
    let totalGst = 0;
    let totalQty = 0;

    formData.items.forEach(item => {
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
    const roundOff = parseFloat(formData.roundOff || 0);
    const finalTotal = grandTotal + roundOff;
    const paymentAmount = parseFloat(formData.paymentAmount || 0);
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
  }, [formData.items, formData.roundOff, formData.paymentAmount]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.partyName) newErrors.partyName = "Party name is required";
    if (!formData.billingAddress) newErrors.billingAddress = "Billing address is required";
    if (!formData.invoiceNumber) newErrors.invoiceNumber = "Invoice number is required";
    if (!formData.invoiceDate) newErrors.invoiceDate = "Invoice date is required";

    formData.items.forEach((item, index) => {
      if (!item.item) {
        if (!newErrors.items) newErrors.items = {};
        if (!newErrors.items[index]) newErrors.items[index] = {};
        newErrors.items[index].item = "Item name is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const formattedData = {
      ...formData,
      items: formData.items.map((item, index) => {
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
    if (initialData && isEditMode) {
      setIsEditMode(false);
    }
  };

  const handleCancel = () => {
    if (initialData && isEditMode) {
      setIsEditMode(false);
    } else {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl border border-gray-200 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {initialData ? (isEditMode ? "Edit Invoice" : "View Invoice") : "Create Invoice"}
              </h2>
              <p className="text-sm text-gray-500">
                {!isEditMode && initialData
                  ? "Invoice details (read-only)"
                  : "Fill in the invoice details"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {initialData && (
              <button
                type="button"
                onClick={handleEditToggle}
                className="p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
                title={isEditMode ? "Cancel edit" : "Edit invoice"}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onCancel()}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          <div className="space-y-4">
            {/* Top Section - Party Details and Invoice Info */}
            <div className="flex justify-between gap-6">
              {/* Left Side - Party Details */}
              <div className="flex-1 max-w-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Party Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.partyName}
                      onChange={e => handlePartyChange(e.target.value)}
                      disabled={isDisabled}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                    >
                      <option value="">Select Party</option>
                      {PARTIES.map(party => (
                        <option key={party.id} value={party.id}>
                          {party.name}
                        </option>
                      ))}
                    </select>
                    {errors.partyName && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.partyName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone No.
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNo}
                      onChange={e => updateFormField("phoneNo", e.target.value)}
                      disabled={isDisabled}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Billing Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.billingAddress}
                      onChange={e => updateFormField("billingAddress", e.target.value)}
                      disabled={isDisabled}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 outline-none resize-none"
                      placeholder="Billing address"
                    />
                    {errors.billingAddress && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.billingAddress}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Address
                    </label>
                    <textarea
                      value={formData.shippingAddress}
                      onChange={e => updateFormField("shippingAddress", e.target.value)}
                      disabled={isDisabled}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 outline-none resize-none"
                      placeholder="Shipping address"
                    />
                  </div>
                </div>
              </div>

              {/* Right Side - Invoice Details */}
              <div className="w-60 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={e => updateFormField("invoiceNumber", e.target.value)}
                    disabled={isDisabled}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                    placeholder="INV-001"
                  />
                  {errors.invoiceNumber && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.invoiceNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={e => updateFormField("invoiceDate", e.target.value)}
                    disabled={isDisabled}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                  />
                  {errors.invoiceDate && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.invoiceDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Items</h3>

              <div className="overflow-x-auto border border-gray-300 rounded-lg">
                <table className="w-full min-w-max table-fixed" style={{ minWidth: "1200px" }}>
                  <thead>
                    <tr className="bg-gray-50">
                      <th
                        className="border border-gray-300 px-2 py-2 text-sm font-medium text-gray-700"
                        style={{ width: "70px" }}
                      >
                        SN.
                      </th>
                      <th
                        className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
                        style={{ width: "300px" }}
                      >
                        Item
                      </th>
                      <th
                        className="border border-gray-300 px-2 py-2 text-sm font-medium text-gray-700"
                        style={{ width: "100px" }}
                      >
                        HSN
                      </th>
                      <th
                        className="border border-gray-300 px-2 py-2 text-sm font-medium text-gray-700"
                        style={{ width: "135px" }}
                      >
                        Category
                      </th>
                      <th
                        className="border border-gray-300 px-2 py-2 text-sm font-medium text-gray-700"
                        style={{ width: "110px" }}
                      >
                        Size
                      </th>
                      <th
                        className="border border-gray-300 px-2 py-2 text-sm font-medium text-gray-700"
                        style={{ width: "80px" }}
                      >
                        Qty
                      </th>
                      <th
                        className="border border-gray-300 px-2 py-2 text-sm font-medium text-gray-700"
                        style={{ width: "100px" }}
                      >
                        Unit
                      </th>
                      <th
                        className="border border-gray-300 px-2 py-2 text-sm font-medium text-gray-700"
                        style={{ width: "120px" }}
                      >
                        Price/Unit
                      </th>
                      <th
                        className="border border-gray-300 px-2 py-2 text-sm font-medium text-gray-700"
                        style={{ width: "150px" }}
                      >
                        <div>GST</div>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <div className="text-xs">%</div>
                          <div className="text-xs">Amount</div>
                        </div>
                      </th>
                      <th
                        className="border border-gray-300 px-2 py-2 text-sm font-medium text-gray-700"
                        style={{ width: "130px" }}
                      >
                        Amount
                      </th>
                      {(isEditMode || !initialData) && (
                        <th
                          className="border border-gray-300 px-2 py-2 text-sm font-medium text-gray-700"
                          style={{ width: "70px" }}
                        >
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => {
                      const qty = parseFloat(item?.qty || 0);
                      const price = parseFloat(item?.pricePerUnit || 0);
                      const gstRate = parseFloat(item?.gstPercentage || 0);
                      const itemTotal = qty * price;
                      const gstAmount = (itemTotal * gstRate) / 100;
                      const totalAmount = itemTotal + gstAmount;

                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td
                            className="border border-gray-300 px-2 py-2 text-center text-sm"
                            style={{ width: "50px" }}
                          >
                            {index + 1}
                          </td>
                          <td
                            className="border border-gray-300 px-2 py-2"
                            style={{ width: "300px" }}
                          >
                            <input
                              value={item.item}
                              onChange={e => updateItem(index, "item", e.target.value)}
                              disabled={isDisabled}
                              className="w-full px-2 py-1 text-sm border-0 outline-none bg-transparent"
                              placeholder="Item name"
                            />
                            {errors?.items?.[index]?.item && (
                              <p className="text-xs text-red-600 mt-1">Required</p>
                            )}
                          </td>
                          <td
                            className="border border-gray-300 px-2 py-2"
                            style={{ width: "100px" }}
                          >
                            <input
                              value={item.hsn}
                              onChange={e => updateItem(index, "hsn", e.target.value)}
                              disabled={isDisabled}
                              className="w-full px-2 py-1 text-sm border-0 outline-none bg-transparent"
                              placeholder="HSN"
                            />
                          </td>
                          <td
                            className="border border-gray-300 px-2 py-2"
                            style={{ width: "120px" }}
                          >
                            <select
                              value={item.category}
                              onChange={e => updateItem(index, "category", e.target.value)}
                              disabled={isDisabled}
                              className="w-full px-2 py-1 text-sm border-0 outline-none bg-transparent"
                            >
                              <option value="">None</option>
                              {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td
                            className="border border-gray-300 px-2 py-2"
                            style={{ width: "100px" }}
                          >
                            <select
                              value={item.size}
                              onChange={e => updateItem(index, "size", e.target.value)}
                              disabled={isDisabled}
                              className="w-full px-2 py-1 text-sm border-0 outline-none bg-transparent"
                            >
                              <option value="">None</option>
                              {SIZES.map(size => (
                                <option key={size.id} value={size.id}>
                                  {size.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td
                            className="border border-gray-300 px-2 py-2"
                            style={{ width: "80px" }}
                          >
                            <input
                              type="number"
                              value={item.qty}
                              onChange={e => updateItem(index, "qty", e.target.value)}
                              disabled={isDisabled}
                              className="w-full px-2 py-1 text-sm border-0 outline-none bg-transparent"
                              min="1"
                              step="1"
                            />
                          </td>
                          <td
                            className="border border-gray-300 px-2 py-2"
                            style={{ width: "100px" }}
                          >
                            <select
                              value={item.unit}
                              onChange={e => updateItem(index, "unit", e.target.value)}
                              disabled={isDisabled}
                              className="w-full px-2 py-1 text-sm border-0 outline-none bg-transparent"
                            >
                              <option value="">None</option>
                              {UNITS.map(unit => (
                                <option key={unit.id} value={unit.id}>
                                  {unit.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td
                            className="border border-gray-300 px-2 py-2"
                            style={{ width: "120px" }}
                          >
                            <input
                              type="number"
                              value={item.pricePerUnit}
                              onChange={e => updateItem(index, "pricePerUnit", e.target.value)}
                              disabled={isDisabled}
                              className="w-full px-2 py-1 text-sm border-0 outline-none bg-transparent"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td
                            className="border border-gray-300 px-1 py-2"
                            style={{ width: "150px" }}
                          >
                            <div className="grid grid-cols-2 gap-1">
                              <select
                                value={item.gstPercentage}
                                onChange={e => updateItem(index, "gstPercentage", e.target.value)}
                                disabled={isDisabled}
                                className="w-full px-1 py-1 text-xs border-0 outline-none bg-transparent"
                              >
                                {GST_RATES.map(rate => (
                                  <option key={rate.id} value={rate.id}>
                                    {rate.name}
                                  </option>
                                ))}
                              </select>
                              <div className="px-1 py-1 text-xs text-right">
                                ₹{gstAmount.toFixed(2)}
                              </div>
                            </div>
                          </td>
                          <td
                            className="border border-gray-300 px-2 py-2 text-right text-sm font-medium"
                            style={{ width: "130px" }}
                          >
                            ₹{totalAmount.toFixed(2)}
                          </td>
                          {(isEditMode || !initialData) && (
                            <td
                              className="border border-gray-300 px-2 py-2 text-center"
                              style={{ width: "70px" }}
                            >
                              {formData.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="p-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer "
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
                    <tr className="bg-gray-50 font-medium">
                      <td
                        className="border border-gray-300 px-2 py-2 text-center text-sm"
                        style={{ width: "50px" }}
                      >
                        {(isEditMode || !initialData) && (
                          <button
                            type="button"
                            onClick={addNewItem}
                            className="flex items-center cursor-pointer gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                            title="Add new item"
                          >
                            <Plus className="w-3 h-3" />
                            Add
                          </button>
                        )}
                      </td>
                      <td
                        className="border border-gray-300 px-2 py-2 text-sm"
                        style={{ width: "300px" }}
                      >
                        Total
                      </td>
                      <td
                        className="border border-gray-300 px-2 py-2"
                        style={{ width: "100px" }}
                      ></td>
                      <td
                        className="border border-gray-300 px-2 py-2"
                        style={{ width: "120px" }}
                      ></td>
                      <td
                        className="border border-gray-300 px-2 py-2"
                        style={{ width: "100px" }}
                      ></td>
                      <td
                        className="border border-gray-300 px-2 py-2 text-center text-sm"
                        style={{ width: "80px" }}
                      >
                        {calculations.totalQty}
                      </td>
                      <td
                        className="border border-gray-300 px-2 py-2"
                        style={{ width: "100px" }}
                      ></td>
                      <td
                        className="border border-gray-300 px-2 py-2"
                        style={{ width: "120px" }}
                      ></td>
                      <td
                        className="border border-gray-300 px-2 py-2 text-right text-sm"
                        style={{ width: "150px" }}
                      >
                        ₹{calculations.totalGst.toFixed(2)}
                      </td>
                      <td
                        className="border border-gray-300 px-2 py-2 text-right text-sm"
                        style={{ width: "130px" }}
                      >
                        ₹{calculations.grandTotal.toFixed(2)}
                      </td>
                      {(isEditMode || !initialData) && (
                        <td
                          className="border border-gray-300 px-2 py-2"
                          style={{ width: "70px" }}
                        ></td>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type
                  </label>
                  <select
                    value={formData.paymentType}
                    onChange={e => updateFormField("paymentType", e.target.value)}
                    disabled={isDisabled}
                    className="w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={e => updateFormField("reference", e.target.value)}
                    disabled={isDisabled}
                    className="w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                    placeholder="Reference number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    value={formData.remarks}
                    onChange={e => updateFormField("remarks", e.target.value)}
                    disabled={isDisabled}
                    rows={3}
                    className="w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 outline-none resize-none"
                    placeholder="Additional remarks"
                  />
                </div>
              </div>

              {/* Right Side - Totals */}
              <div className="w-64 space-y-2">
                <div className="flex justify-between py-1 items-center">
                  <span className="text-sm text-gray-600">Round Off:</span>
                  <input
                    type="number"
                    value={formData.roundOff}
                    onChange={e => updateFormField("roundOff", e.target.value)}
                    disabled={isDisabled}
                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded text-right focus:border-blue-500 outline-none"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex justify-between py-2 border-t border-gray-300">
                  <span className="text-base font-semibold text-gray-800">Total Amount:</span>
                  <span className="text-base font-bold text-gray-800">
                    ₹{calculations.finalTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-sm text-gray-600">Payment:</span>
                  <input
                    type="number"
                    value={formData.paymentAmount}
                    onChange={e => updateFormField("paymentAmount", e.target.value)}
                    disabled={isDisabled}
                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded text-right focus:border-blue-500 outline-none"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <div className="flex gap-3 w-1/2 max-w-sm">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 cursor-pointer bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {initialData && isEditMode ? "Cancel" : "Cancel"}
            </button>
            {(isEditMode || !initialData) && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className={`flex-1 flex items-center  cursor-pointer justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white transition-all ${
                  isLoading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                }`}
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Saving..." : initialData ? "Save Changes" : "Create Invoice"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSaleReturn;
