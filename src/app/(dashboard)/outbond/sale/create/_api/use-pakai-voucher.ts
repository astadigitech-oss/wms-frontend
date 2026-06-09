import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  body: {
    voucher_id: any;
  };
};

type Error = AxiosError;

export const usePakaiVoucher = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body }) => {
      const res = await axios.post(`${baseUrl}/pakai-voucher`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Voucher rank successfully applied");
      queryClient.invalidateQueries({ queryKey: ["list-data-cashier"] });
      queryClient.invalidateQueries({ queryKey: ["list-voucher-buyer"] });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Voucher rank failed to apply`);
        console.log("ERROR_PAKAI_VOUCHER:", err);
      }
    },
  });
  return mutation;
};
