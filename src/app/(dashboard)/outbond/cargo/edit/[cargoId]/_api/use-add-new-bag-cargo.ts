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

export const useAddBagCargo = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body }) => {
      const res = await axios.post(`${baseUrl}/add_new_bag`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("new bag successfuly added to Cargo");
      queryClient.invalidateQueries({
        queryKey: ["list-bag-by-user-cargo"],
      });
      queryClient.invalidateQueries({
        queryKey: ["list-product-cargo"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR: ${
            (err?.response?.data as any)?.data?.message ??
            "Failed to add new bag to Cargo"
          }`
        );
        console.log("ERROR_ADD_PRODUCT_CARGO:", err);
      }
    },
  });
  return mutation;
};
