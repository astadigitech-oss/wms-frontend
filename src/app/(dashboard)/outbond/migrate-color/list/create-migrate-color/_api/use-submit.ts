import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useSubmitMigrateColor = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, any>({
    mutationFn: async () => {
      const res = await axios.post(
        `${baseUrl}/migrate-finish`,
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
      toast.success("Migrate Color successfully created");
      queryClient.invalidateQueries({
        queryKey: ["list-select-migrate-color"],
      });
      queryClient.invalidateQueries({ queryKey: ["list-color-migrate"] });
      window.location.href = "/outbond/migrate-color/list";
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Migrate Color failed to create`);
        console.log("ERROR_CREATE_MIGRATE_COLOR:", err);
      }
    },
  });
  return mutation;
};
