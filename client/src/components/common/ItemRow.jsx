import React from "react";
import { Trash2 } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const ItemRow = ({
  index,
  field,
  register,
  errors,
  isDisabled,
  removeItem,
  watchedItem,
  CATEGORIES,
  SIZES,
  UNITS,
  GST_RATES
}) => {
  const { theme } = useTheme();

  const qty = parseFloat(watchedItem?.qty || 0);
  const price = parseFloat(watchedItem?.pricePerUnit || 0);
  const gstRate = parseFloat(watchedItem?.gstPercentage || 0);
  const itemTotal = qty * price;
  const gstAmount = (itemTotal * gstRate) / 100;
  const totalAmount = itemTotal + gstAmount;

  return (
    <tr className={theme.tableRow}>
      <td className={`border ${theme.border} px-2 py-2 text-center text-sm`}>{index + 1}</td>

      {/* Item Name */}
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

      {/* HSN */}
      <td className={`border ${theme.border} px-2 py-2`}>
        <input
          {...register(`purchaseItems.${index}.hsn`)}
          disabled={isDisabled}
          className={`w-full px-2 py-1 text-sm border-0 outline-none bg-transparent ${theme.text.primary}`}
          placeholder="HSN"
        />
      </td>

      {/* Category */}
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

      {/* Size */}
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

      {/* Qty */}
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

      {/* Unit */}
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

      {/* Price/Unit */}
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

      {/* GST */}
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
          <div className={`px-1 py-1 text-xs text-right ${theme.text.primary}`}>
            ₹{gstAmount.toFixed(2)}
          </div>
        </div>
      </td>

      {/* Amount */}
      <td
        className={`border ${theme.border} px-2 py-2 text-right text-sm font-medium ${theme.text.primary}`}
      >
        ₹{totalAmount.toFixed(2)}
      </td>

      {/* Remove button */}
      {!isDisabled && (
        <td className={`border ${theme.border} px-2 py-2 text-center`}>
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="p-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </td>
      )}
    </tr>
  );
};

export default ItemRow;
