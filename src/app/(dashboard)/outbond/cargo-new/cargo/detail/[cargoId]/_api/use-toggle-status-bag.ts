import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  idBag: any;
};

type Error = AxiosError;

export const useToggleStatusBag = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ idBag }) => {
      const res = await axios.post(
        `${baseUrl}/bag/${idBag}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },
    onSuccess: () => {
      toast.success("Status bag successfuly updated");
      queryClient.invalidateQueries({
        queryKey: ["cargo-new-detail-cargo"],
      });
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
            "Failed to update status bag"
          }`,
        );
        console.log("ERROR_TOGGLE_STATUS_BAG:", err);
      }
    },
  });

  return mutation;
};
