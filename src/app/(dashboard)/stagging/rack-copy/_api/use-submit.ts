import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";
import { invalidateQuery } from "@/lib/query";

type RequestType = {
  id: string;
};
type Error = AxiosError;

export const useSubmit = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.post(
        `${baseUrl}/racks/${id}/move-to-display`,
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
      toast.success("successfully updated rack to display");
      invalidateQuery(queryClient, [["list-detail-rack"]]);
      invalidateQuery(queryClient, [["list-racks"]]);
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        console.log(err);
        toast.error(
          `ERROR ${err?.status}: ${
            (err as any)?.response?.data.message ||
            "Rack failed update to display"
          }`
        );
        console.log("ERROR_UPDATE_TO_DISPLAY:", err);
      }
    },
  });
  return mutation;
};
