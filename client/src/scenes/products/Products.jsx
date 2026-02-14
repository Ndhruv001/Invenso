// src/scenes/products/Products.js

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

import {
  useProducts,
  useUpdateProduct,
  useDeleteProduct,
  useCreateProduct
} from "@/hooks/useProducts";

import { useTableControls } from "@/hooks/useTableControls";
import { useConfirmationDialog } from "@/hooks/useConfirmationDialog";
import { useTheme } from "@/hooks/useTheme";
import { useProductFilterOptions } from "@/hooks/useProductFilterOptions";
import { useUIAction } from "@/context/UIActionContext";

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

  // ---------------------------
  // Table Controls
  // ---------------------------
  const { filters, selection, tableState, handlers } = useTableControls({
    FILTER_KEYS,
    resourceName: "Product"
  });

  const { showSelection, setShowSelection, selectedRows, handleSelectionChange } = selection;

  const { pagination, sorting } = tableState;

  const { handleFiltersChange, handleClearFilters, handlePaginationChange, handleSortingChange } =
    handlers;

  // ---------------------------
  // Modal State
  // ---------------------------
  const [activeProduct, setActiveProduct] = useState(null);
  const [modalMode, setModalMode] = useState(null); // "view" | "edit" | "create"

  const handleCancel = useCallback(() => {
    setActiveProduct(null);
    setModalMode(null);
  }, []);

  const openModalWith = useCallback((product, mode) => {
    setActiveProduct(normalizeProductForModal(product));
    setModalMode(mode);
  }, []);

  // ---------------------------
  // Confirmation Dialog
  // ---------------------------
  const { dialogConfig, openDialog, closeDialog } = useConfirmationDialog();

  // ---------------------------
  // Data Fetching
  // ---------------------------
  const { data: productsData, refetch, ...queryStatus } = useProducts(filters);
  const products = productsData?.data ?? [];
  const totalRows = productsData?.pagination?.totalRows ?? 0;

  // ---------------------------
  // Mutations
  // ---------------------------
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // ---------------------------
  // UIAction (CREATE only)
  // ---------------------------
  const { action, clearAction } = useUIAction();

  useEffect(() => {
    if (!action) return;

    if (action.resource !== "product") return;

    if (action.type === "CREATE") {
      openModalWith({}, "create");
      clearAction();
    }
  }, [action, openModalWith, clearAction]);

  // ---------------------------
  // View / Edit (UNCHANGED LOGIC)
  // ---------------------------
  const handleView = useCallback(
    product => {
      if (!product?.id) {
        toast.error("Unable to view: missing product info");
        return;
      }
      openModalWith(product, "view");
    },
    [openModalWith]
  );

  const handleEdit = useCallback(
    product => {
      if (!product?.id) {
        toast.error("Unable to edit: missing product info");
        return;
      }
      openModalWith(product, "edit");
    },
    [openModalWith]
  );

  // ---------------------------
  // Submit Handler
  // ---------------------------
  const handleSubmit = useCallback(
    async productData => {
      try {
        // CREATE
        if (modalMode === "create") {
          await createProductMutation.mutateAsync(productData);
          toast.success("Product created successfully");
        }

        // EDIT
        if (modalMode === "edit") {
          if (!activeProduct?.id) {
            toast.error("Missing product context");
            return;
          }

          await updateProductMutation.mutateAsync({
            id: activeProduct.id,
            data: productData
          });

          toast.success("Product updated successfully");
        }

        handleCancel();
        refetch();
      } catch (err) {
        toast.error(err?.message || "Operation failed");
      }
    },
    [modalMode, activeProduct, createProductMutation, updateProductMutation, handleCancel, refetch]
  );

  // ---------------------------
  // Delete
  // ---------------------------
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

  // ---------------------------
  // Columns
  // ---------------------------
  const columns = useMemo(() => Columns(showSelection), [showSelection]);

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div
      className={`space-y-6 overflow-auto max-h-[calc(100vh-100px)] min-h-0 ${theme.bg} ${theme.text.primary}`}
    >
      <DataFilter
        filters={filters}
        filterOptions={useProductFilterOptions()}
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
          edit: () => {
            if (selectedRows?.length !== 1) {
              toast.error("Select exactly one product to edit");
              return;
            }
            handleEdit(selectedRows[0]);
          },
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

      {modalMode && (
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
