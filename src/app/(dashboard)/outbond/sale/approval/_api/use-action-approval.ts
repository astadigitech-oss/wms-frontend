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

export const useActionApproval = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, action }) => {
      const res = await axios.post(
        `${baseUrl}/vouchers/${id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.action} successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["approval"] });
    },
    onError: (err, variables) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Failed to ${variables.action}`);
        console.log("ERROR_ACTION_APPROVAL:", err);
      }
    },
  });

  return mutation;
};
