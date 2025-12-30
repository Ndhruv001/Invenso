import React from "react";
import { Plus } from "lucide-react";
import ItemRow from "./ItemRow";
import { useTheme } from "@/hooks/useTheme";

const ItemTable = ({
  fields,
  register,
  errors,
  watch,
  removeItem,
  appendItem,
  isDisabled,
  CATEGORIES,
  SIZES,
  UNITS,
  GST_RATES,
}) => {
    const {theme} = useTheme();

  // Calculate total amount dynamically
  const totalAmount = fields.reduce((sum, _, index) => { m
    const item = watch(`purchaseItems.${index}`);
    const qty = parseFloat(item?.qty || 0);
    const price = parseFloat(item?.pricePerUnit || 0);
    const gstRate = parseFloat(item?.gstPercentage || 0);
    const subtotal = qty * price;
    const gst = (subtotal * gstRate) / 100;
    return sum + subtotal + gst;
  }, 0);

  return (
    <div className={`rounded-xl border ${theme.border} overflow-hidden`}>
      <table className="w-full border-collapse">
        <thead className={`${theme.card} border-b ${theme.border}`}>
          <tr className="text-sm font-medium text-left">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Item</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Size</th>
            <th className="px-3 py-2">Unit</th>
            <th className="px-3 py-2">Qty</th>
            <th className="px-3 py-2">Price/Unit</th>
            <th className="px-3 py-2">GST %</th>
            <th className="px-3 py-2">Total</th>
            {!isDisabled && <th className="px-3 py-2 text-center">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {fields.length > 0 ? (
            fields.map((field, index) => (
              <ItemRow
                key={field.id}
                index={index}
                field={field}
                register={register}
                errors={errors}
                theme={theme}
                isDisabled={isDisabled}
                removeItem={removeItem}
                watchedItem={watch(`purchaseItems.${index}`)}
                CATEGORIES={CATEGORIES}
                SIZES={SIZES}
                UNITS={UNITS}
                GST_RATES={GST_RATES}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={10}
                className={`text-center py-4 text-sm ${theme.text.secondary}`}
              >
                No items added yet.
              </td>
            </tr>
          )}
        </tbody>

        <tfoot className={`border-t ${theme.border}`}>
          <tr>
            <td colSpan={8} className="text-right font-medium px-3 py-2">
              Total:
            </td>
            <td
              colSpan={isDisabled ? 2 : 1}
              className={`px-3 py-2 font-semibold ${theme.text.primary}`}
            >
              ₹ {totalAmount.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>

      {!isDisabled && (
        <div className="flex justify-end p-3 border-t">
          <button
            type="button"
            onClick={() =>
              appendItem({
                item: "",
                categoryId: "",
                sizeId: "",
                unitId: "",
                qty: "",
                pricePerUnit: "",
                gstPercentage: "",
              })
            }
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${theme.accent} hover:opacity-90`}
          >
            <Plus size={16} /> Add Item
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ItemTable);
