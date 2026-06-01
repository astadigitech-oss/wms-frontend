import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  cargoId: any;
  body: {
    barcode_bag: string;
  };
};

type Error = AxiosError;

export const useAddBagCargo = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ cargoId, body }) => {

      const res = await axios.post(
        `${baseUrl}/cargo/add-bag/${cargoId}`,
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
      toast.success("Bag successfuly added to Cargo");
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
            "Failed to add Bag to Cargo"
          }`
        );
        console.log("ERROR_ADD_BAG_CARGO:", err);
      }
    },
  });

  return mutation;
};
