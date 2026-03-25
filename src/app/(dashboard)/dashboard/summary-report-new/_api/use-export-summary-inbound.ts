import { toast } from "sonner";

import { useMutate } from "@/lib/query";

type SearchParams = {
  date_from: any;
  date_to: any;
};

export const useExportInboundData = () => {
  const mutation = useMutate<undefined, undefined, SearchParams>({
    endpoint: "/export-combined-summary-inbound",
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
