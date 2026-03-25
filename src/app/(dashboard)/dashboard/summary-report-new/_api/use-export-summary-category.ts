import { toast } from "sonner";

import { useMutate } from "@/lib/query";

type SearchParams = {
  month?: number;
  year?: number;
};

export const useExportSummaryCategory = () => {
  const mutation = useMutate<undefined, undefined, SearchParams>({
    endpoint: "/summary-export",
    method: "get",
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: {
      title: "EXPORT_SELECTEF_DATA",
      message: "Selected Data failed to export",
    },
  });
  return mutation;
};
