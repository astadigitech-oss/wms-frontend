import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: any;
  body: {
    buyer_id: string;
    discount_bulky: string;
  };
};

type Error = AxiosError;

export const useSetSaleCargo = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, body }) => {
      const res = await axios.post(`${baseUrl}/bulky-documents/${id}/sale`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Penjualan cargo successfuly set");
      queryClient.invalidateQueries({
        queryKey: ["cargo-new-info-cargo"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cargo-new-list-cargo"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        toast.error(
          `ERROR: ${
            (err?.response?.data as any)?.data?.message ??
            "Failed to set penjualan cargo"
          }`,
        );
        console.log("ERROR_SET_SALE_CARGO:", err);
      }
    },
  });

  return mutation;
};
