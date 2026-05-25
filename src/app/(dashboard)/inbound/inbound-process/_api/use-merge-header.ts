import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

type RequestType = {
  code_document: any;
  channel_id: any;
  headerMappings: {
    old_barcode_product: string[];
    old_name_product: string[];
    old_quantity_product: string[];
    old_price_product: string[];
  };
};

type Error = AxiosError;

export const useMergeHeader = () => {
  const accessToken = getCookie("accessToken");
  const router = useRouter();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async (value) => {
      const res = await axios.post(`${baseUrl}/generate/merge-headers`, value, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      router.push("/inbound/check-product/manifest-inbound");
    },
    onError: (err) => {
      console.log("ERROR_MERGE_FILE:", err);
    },
  });
  return mutation;
};
