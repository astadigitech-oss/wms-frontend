import { toast } from "sonner";
import { useMutate } from "@/lib/query";

export const useExportProductCategory = () => {
  const mutation = useMutate({
    endpoint: "/export_product_byCategory",
    method: "post",
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: {
      message: "Product by Category failed to export",
      title: "EXPORT_PRODUCT_CATEGORY",
    },
  });

  return mutation;
};
