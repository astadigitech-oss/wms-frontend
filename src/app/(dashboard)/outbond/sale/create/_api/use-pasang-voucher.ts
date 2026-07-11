import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  body: {
    voucher: number;
    code_document_sale: string;
  };
};

type Error = AxiosError;

export const usePasangVoucher = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body }) => {
      const res = await axios.post(`${baseUrl}/sale-documents/voucher`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Voucher successfully applied");
      queryClient.invalidateQueries({ queryKey: ["list-data-cashier"] });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Voucher failed to apply`);
        console.log("ERROR_PASANG_VOUCHER:", err);
      }
    },
  });

  return mutation;
};
