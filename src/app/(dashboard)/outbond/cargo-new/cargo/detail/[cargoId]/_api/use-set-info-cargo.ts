import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: any;
  body: {
    brand_id: string;
    category_id: string;
    product_condition_id: string;
    package_condition_id: string;
    origin_product_id: string;
  };
};

type Error = AxiosError;

export const useSetInfoCargo = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, body }) => {
      const res = await axios.post(`${baseUrl}/cargo/${id}/set-info`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Info cargo successfuly updated");
      queryClient.invalidateQueries({
        queryKey: ["cargo-new-info-cargo"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cargo-new-detail-cargo"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        toast.error(
          `ERROR: ${
            (err?.response?.data as any)?.data?.message ??
            "Failed to update info cargo"
          }`,
        );
        console.log("ERROR_SET_INFO_CARGO:", err);
      }
    },
  });

  return mutation;
};
