import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: string;
  body: any;
};

type Error = AxiosError;

export const useUpdateCargo = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id, body }) => {
      const res = await axios.put(`${baseUrl}/bulky-documents/${id}`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
     onSuccess: () => {
      toast.success("successfuly updated Cargo");
      queryClient.invalidateQueries({
        queryKey: ["list-bag-by-user-cargo"],
      });
      queryClient.invalidateQueries({
        queryKey: ["list-product-cargo"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: cargo failed to update`);
        console.log("ERROR_UPDATE_CARGO:", err);
      }
    },
  });
  return mutation;
};
