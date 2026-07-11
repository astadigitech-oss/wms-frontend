import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  body: {
    code_document_sale: string;
  };
};

type Error = AxiosError;

export const useDeleteVoucher = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body }) => {
      const res = await axios.delete(`${baseUrl}/sale-documents/voucher`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: body,
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Voucher successfully removed");
      queryClient.invalidateQueries({ queryKey: ["list-data-cashier"] });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Voucher failed to remove`);
        console.log("ERROR_DELETE_VOUCHER:", err);
      }
    },
  });

  return mutation;
};
