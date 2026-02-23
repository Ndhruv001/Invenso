import { useMutation } from "@tanstack/react-query";
import { sentInvoicesOnWhatsApp } from "@/services/adminServices";

const useSentInvoicesOnWhatsApp = () => {
  return useMutation({
    mutationFn: () => sentInvoicesOnWhatsApp()
  });
};

export default useSentInvoicesOnWhatsApp;
export { useSentInvoicesOnWhatsApp };
