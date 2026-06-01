import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  description: string;
  status: string;
  id: string;
};

type Error = AxiosError;

export const useLPRProductStaging = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, status, description }) => {
      const res = await axios.post(
        `${baseUrl}/staging/move_to_lpr/${id}`,
        { status, description },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("Product successfully Moved to LPR");
      queryClient.invalidateQueries({ queryKey: ["list-product-staging"] });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: "Product failed to Move to LPR"`);
        console.log("ERROR_TO_LPR_PRODUCT:", err);
      }
    },
  });
  return mutation;
};
