import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Plus, AlertCircle } from "lucide-react";
import { yupResolver } from "@hookform/resolvers/yup";
import categorySchema from "@/validations/category.schema";
import useTheme from "@/hooks/useTheme";

function AddCategory({ setShowCategoryModal, setAddCategory, initialData = null }) {
  const { theme } = useTheme();
  const [isModified, setIsModified] = useState(false);

  const {
    register: registerCategory,
    handleSubmit: handleCategorySubmit,
    reset: resetCategory,
    watch,
    formState: { errors: categoryErrors }
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || ""
    }
  });

  // Watch form changes to detect modifications
  const formValues = watch();
  useEffect(() => {
    const hasChanges =
      formValues.name.trim() !== (initialData?.name || "") ||
      formValues.description.trim() !== (initialData?.description || "");
    setIsModified(hasChanges);
  }, [formValues, initialData]);

  const handleAddCategory = (data) => {
    const newCategory = {
      id: Date.now(),
      name: data.name.trim(),
      description: data.description.trim()
    };
    setAddCategory((prev) => [...prev, newCategory]);
    resetCategory();
    setShowCategoryModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className={`${theme.card} rounded-xl shadow-2xl w-full max-w-sm border ${theme.border}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-gradient-to-r from-${theme.accentFrom} to-${theme.accentTo}`}>
              <Plus className="w-4 h-4 text-white" />
            </div>
            <h3 className={`font-semibold ${theme.text.primary}`}>Add Category</h3>
          </div>
          <button
            onClick={() => {
              setShowCategoryModal(false);
              resetCategory();
            }}
            className={`p-1 ${theme.text.muted} rounded transition-colors cursor-pointer hover:text-red-600`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Form */}
        <form onSubmit={handleCategorySubmit(handleAddCategory)} className="p-4 space-y-3">
          {/* Category Name */}
          <div>
            <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
              Category Name
            </label>
            <input
              type="text"
              {...registerCategory("name")}
              placeholder="Enter category name"
              className={`w-full px-3 py-2.5 border rounded-lg outline-none transition-all ${
                categoryErrors.name ? "border-red-300 bg-red-50" : `${theme.border} ${theme.bg}`
              }`}
              autoFocus
            />
            {categoryErrors.name && (
              <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-3 h-3" />
                {categoryErrors.name.message}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
              Description{" "}
              <span className={`text-xs ${theme.text.muted} font-normal`}>(optional)</span>
            </label>
            <textarea
              {...registerCategory("description")}
              placeholder="Brief description"
              rows={2}
              className={`w-full px-3 py-2.5 border rounded-lg outline-none transition-all resize-none ${theme.border} ${theme.bg}`}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowCategoryModal(false);
                resetCategory();
              }}
              className={`flex-1 px-3 py-2 ${theme.text.secondary} ${theme.bg} border ${theme.border} rounded-lg ${theme.hover} transition-all text-sm font-medium cursor-pointer`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-3 py-2 bg-gradient-to-r from-${theme.accentFrom} to-${theme.accentTo} text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium cursor-pointer`}
            >
              {isModified ? "Save Changes" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCategory;
export { AddCategory };
