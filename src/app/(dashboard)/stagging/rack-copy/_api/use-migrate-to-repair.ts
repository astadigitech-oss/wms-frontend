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

export const useMigrateToRepair = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.post(
        `${baseUrl}/staging/to-migrate/${id}`,
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
      toast.success("successfully updated products staging to dump");
      queryClient.invalidateQueries({ queryKey: ["list-staging-product"] });
      queryClient.invalidateQueries({ queryKey: ["list-product-staging"] });
      queryClient.invalidateQueries({
        queryKey: ["list-filter-staging-product"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR ${err?.status}: products staging failed update to dump`
        );
        console.log("ERROR_UPDATE_TO_DUMP:", err);
      }
    },
  });
  return mutation;
};
