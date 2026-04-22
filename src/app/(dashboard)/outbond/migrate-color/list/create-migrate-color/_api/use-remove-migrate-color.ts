import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: string;
};

type Error = AxiosError;

export const useRemoveMigrateColor = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.delete(`${baseUrl}/migrates/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Migrate successfully removed");
      queryClient.invalidateQueries({
        queryKey: ["list-select-migrate-color"],
      });
      queryClient.invalidateQueries({ queryKey: ["list-color-migrate"] });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Migrate failed to remove`);
        console.log("ERROR_REMOVE_MIGRATE:", err);
      }
    },
  });
  return mutation;
};
