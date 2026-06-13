import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type Error = AxiosError;
type FinishSkuPayload = {
  documentId: string | number;
};

export const useCheckFinishSku = () => {
  const accessToken = getCookie("accessToken");

  const mutation = useMutation<AxiosResponse, Error, FinishSkuPayload>({
    mutationFn: async ({ documentId }) => {
      const safeDocumentId = encodeURIComponent(String(documentId));
      const res = await axios.post(
        `${baseUrl}/sku/cek/finish-sku/${safeDocumentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR ${err?.status}: ${
            (err.response?.data as any)?.data?.message ||
            "Document failed to check"
          } `,
        );
        console.log("ERROR_CHECK_FINISH_SKU:", err);
      }
    },
  });
  return mutation;
};

export const useFinishSku = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, FinishSkuPayload>({
    mutationFn: async ({ documentId }) => {
      const safeDocumentId = encodeURIComponent(String(documentId));
      const res = await axios.post(
        `${baseUrl}/sku/finish-sku/${safeDocumentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },
    onSuccess: () => {
      toast.success("Document SKU successfully finished");
      queryClient.invalidateQueries({
        queryKey: ["detail-manifest-inbound-sku"],
      });
      window.location.href = "/inventory/product/sku";
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR ${err?.status}: ${
            (err.response?.data as any)?.data?.message ||
            "Product failed to finish"
          } `,
        );
        console.log("ERROR_FINISH_SKU:", err);
      }
    },
  });
  return mutation;
};
