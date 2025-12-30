// src/hooks/useConfirmationDialog.js
import { useState, useCallback } from 'react';

function useConfirmationDialog() {
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false });

  const openDialog = useCallback(({ title, message, onConfirm }) => {
    setDialogConfig({
      isOpen: true,
      isLoading: false,
      title,
      message,
      onConfirm: async () => {
        setDialogConfig(prev => ({ ...prev, isLoading: true }));
        try {
          await onConfirm();
          setDialogConfig({ isOpen: false }); // Close on success
        } catch (error) {
          console.error("Confirmation action failed:", error);
          setDialogConfig(prev => ({ ...prev, isLoading: false })); // Stop loading on error
        }
      },
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  return { dialogConfig, openDialog, closeDialog };
}

export default useConfirmationDialog;
export { useConfirmationDialog };