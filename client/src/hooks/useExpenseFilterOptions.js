import { useMemo } from "react";
import { useCategories } from "@/hooks/useCategories";
import { format } from "date-fns";

/**
 * Expense filter options for table and search filter UI.
 * Category dropdown includes only type = "EXPENSE" categories.
 */
function useExpenseFilterOptions() {
  const { data: expenseCategories } = useCategories("EXPENSE");

  const categoryOptions = useMemo(
    () =>
      expenseCategories?.data?.map(cat => ({
        value: String(cat.id),
        label: cat.name
      })) || [],
    [expenseCategories]
  );

  const currentDate = format(new Date(), "yyyy-MM-dd");

  return [
    {
      key: "categoryId",
      type: "select",
      label: "Category",
      placeholder: "All Categories",
      options: categoryOptions
    },
    {
      key: "dateFrom",
      type: "date",
      label: "From Date",
      placeholder: "Start Date",
      defaultValue: "",
      max: currentDate
    },
    {
      key: "dateTo",
      type: "date",
      label: "To Date",
      placeholder: "End Date",
      defaultValue: "",
      max: currentDate
    }
  ];
}

export default useExpenseFilterOptions;
export { useExpenseFilterOptions };
