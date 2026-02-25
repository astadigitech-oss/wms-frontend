import { toast } from "sonner";
import { useMutate } from "@/lib/query";

export const useExportRackCategory = () => {
  const mutation = useMutate({
    endpoint: "/export_rack_byCategory",
    method: "post",
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: {
      message: "Rack by Category failed to export",
      title: "EXPORT_RACK_CATEGORY",
    },
  });

  return mutation;
};
