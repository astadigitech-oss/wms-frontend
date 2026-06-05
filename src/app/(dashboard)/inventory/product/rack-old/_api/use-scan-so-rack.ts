import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";
import { invalidateQuery } from "@/lib/query";

type Error = AxiosError;

export const useScanSOrack = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, { barcode: string }>({
    mutationFn: async ({ barcode }) => {
      const res = await axios.post(
        `${baseUrl}/racks/so`,
        { barcode },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },
    onSuccess: (res) => {
      toast.success(
        res.data?.data?.message || "Barcode rack scanned successfully",
      );
      invalidateQuery(queryClient, [["list-detail-rack-display"]]);
      invalidateQuery(queryClient, [["list-racks-display"]]);
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Failed to scan barcode`);
        console.log("ERROR_SCAN_SO_RACK:", err);
      }
    },
  });
  return mutation;
};
