import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  body: {
    start_date: string;
    end_date: string;
  };
};

type Error = AxiosError;

export const useExportSalesReguler = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ body }) => {
      const res = await axios.post(`${baseUrl}/export-sales-reguler`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("File Successfully Exported");
    },
    onError: (err) => {
      if (err.response?.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR ${err.response?.status}: Sales Reguler failed to export`
        );
        console.log("ERROR_EXPORT_SALES_REGULER:", err);
      }
    },
  });
  return mutation;
};
