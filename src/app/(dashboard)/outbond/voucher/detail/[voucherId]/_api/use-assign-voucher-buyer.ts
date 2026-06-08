import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: any;
  body: any;
};

type Error = AxiosError;

export const useAssignVoucherBuyer = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, body }) => {
      const res = await axios.post(`${baseUrl}/vouchers/${id}/buyers`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: (_data, variables) => {
      toast.success("Buyer successfully added to voucher");
      queryClient.invalidateQueries({
        queryKey: ["detail-voucher", variables.id],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Buyer failed to add`);
        console.log("ERROR_ASSIGN_VOUCHER_BUYER:", err);
      }
    },
  });
  return mutation;
};
