import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStockAdjustment } from "@/services/stockAdjustmentServices";

// ---------------------------------------------
// STOCK ADJUST HOOKS
// ---------------------------------------------

const QUERY_KEYS = {
  PRODUCTS: "products",
  PRODUCT: "product",
  CURRENT_STOCK: "currentStock",
  INVENTORY_LOG: "inventories"
};

const useStockAdjustments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adjustData => createStockAdjustment(adjustData),

    onSuccess: (_, variables) => {
      // Invalidate product list (stock changed)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVENTORY_LOG] });

      // Invalidate specific product if open
      if (variables?.productId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.PRODUCT, variables.productId]
        });

        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.CURRENT_STOCK, variables.productId]
        });
      }
    }
  });
};

export default {
  useStockAdjustments
};

export { useStockAdjustments };
