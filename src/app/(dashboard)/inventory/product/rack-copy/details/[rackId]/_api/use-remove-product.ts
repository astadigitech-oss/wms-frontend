import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  body: any;
};

type Error = AxiosError;

export const useRemoveProduct = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body }) => {
      const res = await axios.post(`${baseUrl}/racks/remove-product`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Product successfully removed");
      queryClient.invalidateQueries({
        queryKey: ["list-product-detail-display"],
      });
      queryClient.invalidateQueries({
        queryKey: ["list-detail-rack-display"],
      });
      queryClient.invalidateQueries({
        queryKey: ["list-racks-display"],
      });
    },
    onError: (err) => {
      const status = err.response?.status;

      if (status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        toast.error(`ERROR ${status}: Product failed to remove`);
        console.error("ERROR_REMOVE_PRODUCT:", err);
      }
    },
  });
};
