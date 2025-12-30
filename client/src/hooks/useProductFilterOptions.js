// ✅ Rename file to useProductFilterOptions.js
import { useMemo } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useHsnCodes } from "@/hooks/useProducts";
import { ACP_SHEET_SIZE_OPTIONS } from "@/constants/ACP_SHEET_SIZES";
import STOCK_STATUSES from "@/constants/STOCK_STATUSES";

function useProductFilterOptions() {
  const { data: categoryData, isLoading } = useCategories("PRODUCT");
  const { data: hsnCodesData } = useHsnCodes();

  const categoryOptions = useMemo(
    () => categoryData?.map(cat => ({ value: String(cat.id), label: cat.name })) || [],
    [categoryData]
  );

const hsnCodeOptions = useMemo(
  () =>
    hsnCodesData
      ?.filter(item => item?.hsnCode?.trim()) 
      .map(item => ({
        value: item.hsnCode.trim(),
        label: item.hsnCode.trim(),
      })) || [],
  [hsnCodesData]
);

  const stockOptions = useMemo(
    () =>
      STOCK_STATUSES.map(status => ({
        value: status,
        label: status.charAt(0).toUpperCase() + status.slice(1)
      })),
    []
  );

  return [
    {
      key: "categoryId",
      type: "select",
      label: "Category",
      placeholder: "All Categories",
      options: categoryOptions,
      loading: isLoading
    },
    {
      key: "hsnCode",
      type: "select",
      label: "HSN Code",
      placeholder: "All HSN Codes",
      options: hsnCodeOptions
    },
    {
      key: "currentStock",
      type: "select",
      label: "Stock Status",
      placeholder: "All Statuses",
      options: stockOptions
    },
    {
      key: "size",
      type: "select",
      label: "Size",
      placeholder: "All Sizes",
      options: ACP_SHEET_SIZE_OPTIONS
    }
  ];
}

export default useProductFilterOptions;
export { useProductFilterOptions };