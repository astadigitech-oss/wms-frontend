import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  idDetail: any;
  productId: any;
  source?: string;
};

type ErrorType = AxiosError;

export const useAddProduct = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, ErrorType, RequestType>({
    mutationFn: async ({ productId, idDetail, source }) => {
      const res = await axios.post(
        `${baseUrl}/product-bundle/${idDetail}/add`,
        {
          product_id: productId,
          source,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return res;
    },

    onSuccess: () => {
      toast.success("Product successfully added");

      queryClient.invalidateQueries({
        queryKey: ["list-product-detail-bundle"],
      });
    },

    onError: (err) => {
      const status = err.response?.status;

      if (status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        toast.error(`ERROR ${status}: Product failed to add`);
        console.log("ERROR_ADD_PRODUCT:", err);
      }
    },
  });

  return mutation;
};