import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

export type RequestType = {
  new_name_product: string;
  new_quantity_product: string;
  old_price_product: string;
  new_status_product: string;
  new_category_product: string;
  new_price_product: string;
  new_tag_product: string;
  condition: string;
  is_extra: boolean;
  description: string;
};

type Error = AxiosError;

export const useSubmitManualInbound = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async (value) => {
      const res = await axios.post(`${baseUrl}/add_product`, value, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Product Successfully Submited");
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Product failed to submit`);
        console.log("ERROR_SUBMIT_MANUAL_INBOUND:", err);
      }
    },
  });
  return mutation;
};
