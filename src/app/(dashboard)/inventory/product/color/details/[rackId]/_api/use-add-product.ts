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

export const useAddProduct = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body }) => {
      const res = await axios.post(
        `${baseUrl}/color-racks/${body.rack_id}/add-product`,
        body,
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
      queryClient.invalidateQueries({ queryKey: ["list-product-detail-color"] });
      queryClient.invalidateQueries({
        queryKey: ["list-detail-rack-color"],
      });
      queryClient.invalidateQueries({
        queryKey: ["list-racks-color"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR ${err?.status}: ${
            (err.response?.data as any).data.message || "Product failed to add"
          } `
        );
        console.log("ERROR_ADD_PRODUCT:", err);
      }
    },
  });
  return mutation;
};
