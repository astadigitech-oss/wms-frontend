import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;

export const useExportStorageReportByMonthByYear = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, { year: number; month: number }>({
    mutationFn: async ({ year, month }) => {
      const res = await axios.post(
        `${baseUrl}/archive_storage_exports`,
        { year, month },
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
      if (err.response?.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(`ERROR ${err?.response?.status}: Storage Report failed to export`);
        console.log("ERROR_EXPORT_STORAGE_REPORT:", err);
      }
    },
  });
  return mutation;
};