import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useExportAllCargo = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, void>({
    mutationFn: async () => {
      const res = await axios.get(
        `${baseUrl}/export-cargo-products?status=proses`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: (err) => {
      const status = err.response?.status;

      if (status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        toast.error(`ERROR ${status}: All Cargo failed to export`);
        console.error("ERROR_EXPORT_ALL_CARGO:", err);
      }
    },
  });

  return mutation;
};
