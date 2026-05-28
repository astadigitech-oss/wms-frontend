import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  cargoId: any;
  body: any;
};

type Error = AxiosError;

export const useRemoveBagCargo = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ cargoId, body }) => {
      const res = await axios.post(
        `${baseUrl}/cargo/${cargoId}/takeout-bag`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },
    onSuccess: () => {
      toast.success("Bag successfully removed from Cargo");
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
            "Failed to remove Bag from Cargo"
          }`,
        );
        console.log("ERROR_REMOVE_BAG_CARGO:", err);
      }
    },
  });

  return mutation;
};
