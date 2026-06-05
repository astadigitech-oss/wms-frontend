import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";
import { invalidateQuery } from "@/lib/query";

type RequestType = {
  id: string;
};
type Error = AxiosError;

export const useStockOpname = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.post(
        `${baseUrl}/racks/${id}/so`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("Stock Opname berhasil dilakukan");
      invalidateQuery(queryClient, [["list-detail-rack-display"]]);
      invalidateQuery(queryClient, [["list-racks-display"]]);
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        console.log(err);
        toast.error(
          `ERROR ${err?.status}: ${
            (err as any)?.response?.data.message ||
            "Stock Opname gagal"
          }`
        );
        console.log("ERROR_STOCK_OPNAME:", err);
      }
    },
  });

  return mutation;
};
