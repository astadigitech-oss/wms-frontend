import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: string;
  action: "approve" | "reject";
};

type Error = AxiosError;

export const useActionProductMI = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, action }) => {
      const res = await axios.post(
        `${baseUrl}/notifications/manual-product/${id}/action`,
        {
          action,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },

    onSuccess: (_, variables) => {
      toast.success(
        `Product Manual Inbound successfully ${variables.action}`
      );

      queryClient.invalidateQueries({
        queryKey: ["list-list-notif"],
      });
    },

    onError: (err, variables) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR ${err?.status}: Failed to ${variables.action}`
        );
        console.log("ERROR_ACTION_PRODUCT_MI:", err);
      }
    },
  });

  return mutation;
};