import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: string;
};

type Error = AxiosError;

export const useAddFilterProductStaging = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.post(
        `${baseUrl}/staging/filter_product/${id}/add`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("Product successfully added to filter");
      queryClient.invalidateQueries({ queryKey: ["list-staging-product"] });
      queryClient.invalidateQueries({ queryKey: ["list-product-staging"] });
      queryClient.invalidateQueries({
        queryKey: ["list-filter-staging-product"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Product failed to add to filter`);
        console.log("ERROR_ADD_FILTER_PRODUCT:", err);
      }
    },
  });
  return mutation;
};
