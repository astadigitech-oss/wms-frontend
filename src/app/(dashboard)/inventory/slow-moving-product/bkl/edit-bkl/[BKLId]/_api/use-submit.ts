import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useSubmitBKL = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, any>({
    mutationFn: async (id: string) => {
      const res = await axios.post(
        `${baseUrl}/bkl/${id}/submit`,
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
      toast.success("BKL successfully created");
      queryClient.invalidateQueries({
        queryKey: ["list-list-bkl"],
      });
      queryClient.invalidateQueries({ queryKey: ["list-detail-bkl"] });
      window.location.href = "/inventory/slow-moving-product/bkl";
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR ${err?.status}: ${
            (err.response?.data as any).data.message || "BKL failed to create"
          } `,
        );
        console.log("ERROR_CREATE_BKL:", err);
      }
    },
  });
  return mutation;
};
