import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useSyncOlseraTokens = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error>({
    mutationFn: async () => {
      const res = await axios.post(
        `${baseUrl}/olsera/sync-tokens`,
        null, 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return res;
    },
    onSuccess: () => {
      toast.success("Olsera tokens successfully synced");
      queryClient.invalidateQueries({ queryKey: ["list-destination-mc"] });
    },
    onError: (err) => {
      const status = err.response?.status;

      if (status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        toast.error(`ERROR ${status}: Failed to sync tokens`);
        console.log("ERROR_SYNC_OLSERA:", err);
      }
    },
  });

  return mutation;
};
