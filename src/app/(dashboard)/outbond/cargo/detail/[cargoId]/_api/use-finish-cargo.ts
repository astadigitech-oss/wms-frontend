import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useFinishCargo = ({ cargoId }: any) => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, any>({
    mutationFn: async () => {
      const res = await axios.post(
        `${baseUrl}/bulky-sale-finish?id=${cargoId}`,
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
      toast.success("Cargo successfuly finished");
      queryClient.invalidateQueries({
        queryKey: ["list-sale-cargo"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR: ${
            (err?.response?.data as any)?.data?.message ??
            "Failed to finish cargo"
          }`
        );
        console.log("ERROR_FINISH_CARGO:", err);
      }
    },
  });
  return mutation;
};
