import { useMemo } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import purchaseSchema from "@/validations/purchaseSchema";
import { computeTotals } from "@/utils/purchaseUtils";

export default function usePurchaseForm({ initialData, onSubmit, defaultValuesOverride }) {
  const defaultValues = useMemo(() => ({
    partyName: initialData?.party?.name || "",
    phoneNo: initialData?.party?.phone || "",
    billingAddress: initialData?.billingAddress || "",
    shippingAddress: initialData?.shippingAddress || "",
    invoiceNumber: initialData?.invoiceNumber || "",
    invoiceDate: initialData?.invoiceDate || "",
    items: initialData?.purchaseItems?.length ? initialData.purchaseItems : [{
      item: "",
      hsn: "",
      category: "",
      size: "",
      qty: 1,
      unit: "",
      pricePerUnit: 0,
      gstPercentage: "18"
    }],
    paymentType: initialData?.paymentMode || "",
    reference: initialData?.paymentReference || "",
    remarks: initialData?.remarks || "",
    roundOff: initialData?.roundOff ?? 0,
    paymentAmount: initialData?.totalAmount ?? 0,
    ...defaultValuesOverride
  }), [initialData, defaultValuesOverride]);

  const methods = useForm({
    defaultValues,
    resolver: yupResolver(purchaseSchema),
    mode: "onSubmit",
    reValidateMode: "onBlur"
  });

  const { control, watch, reset, handleSubmit, setValue } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch("items");
  const watchedRoundOff = watch("roundOff");
  const watchedPaymentAmount = watch("paymentAmount");

  const totals = useMemo(() => computeTotals(watchedItems, watchedRoundOff, watchedPaymentAmount), [
    watchedItems, watchedRoundOff, watchedPaymentAmount
  ]);

  function addNewItem() {
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
  }

  function removeItem(index) {
    if (fields.length > 1) remove(index);
  }

  function submit(values) {
    // Transform values to final payload
    const payload = {
      ...values,
      items: values.items.map((it, i) => {
        const qty = parseFloat(it.qty || 0);
        const price = parseFloat(it.pricePerUnit || 0);
        const gstRate = parseFloat(it.gstPercentage || 0);
        const itemTotal = qty * price;
        const gstAmount = (itemTotal * gstRate) / 100;
        return { ...it, sn: i + 1, qty, pricePerUnit: price, gstAmount, amount: itemTotal + gstAmount };
      }),
      ...totals
    };
    onSubmit(payload);
  }

  return {
    methods,
    fields,
    addNewItem,
    removeItem,
    totals,
    reset,
    submit: handleSubmit(submit),
    setValue,
    defaults: defaultValues
  };
}
