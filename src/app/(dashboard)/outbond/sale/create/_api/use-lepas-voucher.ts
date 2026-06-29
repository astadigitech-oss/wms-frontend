import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useLepasVoucher = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error>({
    mutationFn: async () => {
      const res = await axios.post(
        `${baseUrl}/lepas-voucher`,
        undefined,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("Voucher rank successfully removed");
      queryClient.invalidateQueries({ queryKey: ["list-data-cashier"] });
      queryClient.invalidateQueries({ queryKey: ["list-voucher-buyer"] });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Voucher rank failed to remove`);
        console.log("ERROR_LEPAS_VOUCHER:", err);
      }
    },
  });
  return mutation;
};
