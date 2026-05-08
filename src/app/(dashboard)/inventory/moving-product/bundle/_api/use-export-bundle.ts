import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useExportBundle = ({ start_date, end_date }: any) => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, "">({
    mutationFn: async () => {
      const query = new URLSearchParams();

      if (start_date) query.append("start_date", start_date);
      if (end_date) query.append("end_date", end_date);

      const res = await axios.get(
        `${baseUrl}/exportBundles${
          query.toString() ? `?${query.toString()}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: (err: AxiosError<any>) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        const message =
          err?.response?.data?.data?.message || "Bundle failed to export";
        toast.error(`ERROR ${err?.status}: ${message}`);
        console.log("ERROR_EXPORT_BUNDLE:", err);
      }
    },
  });
  return mutation;
};
