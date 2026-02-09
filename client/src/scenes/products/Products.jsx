// src/scenes/products/Products.js
import React, { useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";

import { useProducts, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useTableControls } from "@/hooks/useTableControls";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useTheme } from "@/hooks/useTheme";
import { useProductFilterOptions } from "@/hooks/useProductFilterOptions";

import Columns from "./Columns";
import ProductModal from "./ProductModal";
import ProductsSummaryStats from "./ProductsSummaryStats";
import ActionRibbon from "../../components/common/ActionRibbon";
import DataTable from "@/components/common/DataTable";
import DataFilter from "@/components/common/DataFilter";
import ConfirmationModal from "@/components/common/ConfirmationModal";

// Filters synced with URL state
const FILTER_KEYS = ["categoryId", "hsnCode", "currentStock"];

/**
 * Normalize a product for modal use.
 * Prevents runtime issues when opening view/edit forms with incomplete data.
 */
function normalizeProductForModal(product) {
  if (!product) return null;
  return {
    id: product.id ?? undefined,
    name: product.name ?? "",
    ...product
  };
}

const Products = () => {
  const { theme } = useTheme();

  // Unified table controls (filters, pagination, sorting, selection)
  const { filters, selection, tableState, handlers } = useTableControls({
    FILTER_KEYS,
    resourceName: "Product"
  });

  const { showSelection, setShowSelection, selectedRows, handleSelectionChange } = selection;
  const { pagination, sorting } = tableState;
  const { handleFiltersChange, handleClearFilters, handlePaginationChange, handleSortingChange } =
    handlers;

  // Modal state
  const [activeProduct, setActiveProduct] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "view" | "edit" | "create"

  // Confirmation dialog hook
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // Product data
  const { data: productsData, refetch, ...queryStatus } = useProducts(filters);
  const products = productsData?.data ?? [];
  const totalRows = productsData?.pagination?.totalRows ?? 0;

  // Mutations
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Filter options
  const filterOptions = useProductFilterOptions();

  /** ---- Handlers ---- **/

  const openModalWith = useCallback((product, mode) => {
    setActiveProduct(normalizeProductForModal(product));
    setModalMode(mode);
  }, []);

  const handleView = useCallback(
    product => {
      if (!product?.id) return toast.error("Unable to view: missing product info");
      openModalWith(product, "view");
    },
    [openModalWith]
  );

  const handleEdit = useCallback(
    product => {
      if (!product?.id) return toast.error("Unable to edit: missing product info");
      openModalWith(product, "edit");
    },
    [openModalWith]
  );

  const handleCancel = useCallback(() => {
    setActiveProduct(null);
    setModalMode(null);
  }, []);

  const handleSubmit = useCallback(
    async productData => {
      if (!activeProduct?.id) {
        toast.error("Cannot save: missing product context");
        return;
      }

      await updateProductMutation.mutateAsync(
        { id: activeProduct.id, data: productData },
        {
          onSuccess: () => {
            toast.success("Product updated successfully");
            handleCancel();
          },
          onError: err => toast.error(err?.message || "Failed to update product")
        }
      );
    },
    [activeProduct, updateProductMutation, handleCancel]
  );

  const handleDelete = useCallback(() => {
    if (!selectedRows?.length) {
      toast.error("No products selected");
      return;
    }

    openDialog({
      title: "Delete Selected Products",
      message: `Are you sure you want to delete ${selectedRows.length} product(s)?`,
      onConfirm: async () => {
        try {
          // Use Promise.allSettled to handle each delete safely
          const results = await Promise.allSettled(
            selectedRows.map(p => deleteProductMutation.mutateAsync(p.id))
          );

          const successCount = results.filter(r => r.status === "fulfilled").length;
          const failedCount = results.length - successCount;

          if (successCount > 0) {
            toast.success(`${successCount} product(s) deleted successfully`);
            handleSelectionChange([]);
            refetch();
          }

          if (failedCount > 0) {
            toast.error(`${failedCount} product(s) failed to delete`);
          }
        } catch (err) {
          toast.error(err?.message || "Unexpected error during deletion");
        }
      }
    });
  }, [selectedRows, deleteProductMutation, openDialog, handleSelectionChange, refetch]);

  // Memoized column definitions
  const columns = useMemo(() => Columns(showSelection), [showSelection]);

  return (
    <div
      className={`space-y-6 overflow-auto max-h-[calc(100vh-100px)] min-h-0 ${theme.bg} ${theme.text.primary}`}
    >
      <DataFilter
        filters={filters}
        filterOptions={filterOptions}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        totalRows={totalRows}
        searchPlaceholder="Search products, categories, HSN..."
        className="sticky top-0 z-10 bg-inherit"
      />

      <ProductsSummaryStats stats={productsData?.stats} />

      <ActionRibbon
        resourceName="Product"
        actions={["edit", "delete", "print", "download"]}
        selectionOpen={showSelection}
        selectedCount={selectedRows?.length}
        onToggleSelection={() => setShowSelection(prev => !prev)}
        handlers={{
          edit: () => handleEdit(selectedRows?.[0]),
          delete: handleDelete,
          print: null,
          download: null
        }}
      />

      <DataTable
        data={products}
        columns={columns}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        showSelection={showSelection}
        onSelectionChange={handleSelectionChange}
        onRowDoubleClick={handleView}
        refetch={refetch}
        {...queryStatus}
      />

      {activeProduct && (
        <ProductModal
          initialData={activeProduct}
          isViewOnly={modalMode === "view"}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      )}

      {dialogConfig.isOpen && <ConfirmationModal {...dialogConfig} onCancel={closeDialog} />}
    </div>
  );
};

Products.displayName = "Products";

export default Products;
