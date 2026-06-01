import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  body: {
    category_id: string | number;
  };
};

type Error = AxiosError;

export const useAddBag = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body }) => {
      const res = await axios.post(`${baseUrl}/bag`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Bag successfully created");
      queryClient.invalidateQueries({
        queryKey: ["cargo-new-list-bag"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        toast.error(
          `ERROR: ${
            (err?.response?.data as any)?.data?.message ?? "Failed to create bag"
          }`,
        );
        console.log("ERROR_ADD_BAG:", err);
      }
    },
  });

  return mutation;
};
