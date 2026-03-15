import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: any;
  source?: string;
};

type Error = AxiosError;

export const useAddProduct = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, source }) => {
      const res = await axios.post(
        `${baseUrl}/bundle/filter_product/${id}/add`,
        { source },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },
    onSuccess: () => {
      toast.success("Product successfully added");
      queryClient.invalidateQueries({ queryKey: ["data-create-bundle"] });
      queryClient.invalidateQueries({
        queryKey: ["list-product-create-bundle"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Product failed to add`);
        console.log("ERROR_ADD_PRODUCT:", err);
      }
    },
  });
  return mutation;
};
