import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useScanMigrateToDisplayProduct = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, { barcode: string }>({
    mutationFn: async ({ barcode }) => {
      const res = await axios.post(
        `${baseUrl}/display-product-color`,
        { barcode },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: (res) => {
      toast.success(res.data?.data?.message || "Barcode scanned successfully");
      queryClient.invalidateQueries({
        queryKey: ["list-product-color-apk"],
      });
       queryClient.invalidateQueries({
        queryKey: ["list-product-color-wms"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Failed to scan barcode`);
        console.log("ERROR_SCAN_MIGRATE_TO_DISPLAY_PRODUCT:", err);
      }
    },
  });
  return mutation;
};
