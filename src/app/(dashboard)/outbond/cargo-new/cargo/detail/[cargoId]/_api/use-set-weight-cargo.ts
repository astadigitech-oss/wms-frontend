import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: any;
  body: {
    length: string;
    width: string;
    height: string;
    weight: string;
  };
};

type Error = AxiosError;

export const useSetWeightCargo = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, body }) => {
      const res = await axios.post(
        `${baseUrl}/cargo/${id}/set-volume-berat`,
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
      toast.success("Weight cargo successfuly updated");
      queryClient.invalidateQueries({
        queryKey: ["cargo-new-info-cargo"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        toast.error(
          `ERROR: ${
            (err?.response?.data as any)?.data?.message ??
            "Failed to update weight cargo"
          }`,
        );
        console.log("ERROR_SET_WEIGHT_CARGO:", err);
      }
    },
  });

  return mutation;
};
