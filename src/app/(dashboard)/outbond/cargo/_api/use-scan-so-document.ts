import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useScanSODocument = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, { code_document: string }>({
    mutationFn: async ({ code_document }) => {
      const res = await axios.post(
        `${baseUrl}/b2b-documents/so`,
        { code_document },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },
    onSuccess: (res) => {
      toast.success(res.data?.data?.message || "Code Document scanned successfully");
      queryClient.invalidateQueries({
        queryKey: ["list-cargo"],
      });
      queryClient.invalidateQueries({
        queryKey: ["detail-cargo"],
      });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.status}: Failed to scan code document`);
        console.log("ERROR_SCAN_SO_BARANG:", err);
      }
    },
  });
  return mutation;
};
