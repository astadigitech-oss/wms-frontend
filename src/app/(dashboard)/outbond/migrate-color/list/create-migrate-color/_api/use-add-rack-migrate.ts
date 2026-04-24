import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { toast } from "sonner";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useAddRackMigrate = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, any>({
    mutationFn: async (body: any) => {
      const res = await axios.post(`${baseUrl}/migrate-rack/add`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Rack successfully added");
      queryClient.invalidateQueries({
        queryKey: ["list-color-migrate"],
      });
      queryClient.invalidateQueries({
        queryKey: ["list-rack-migrate-color-to-pos"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Add rack failed`);
        console.log("ERROR_ADD_RACK_MIGRATE:", err);
      }
    },
  });

  return mutation;
};