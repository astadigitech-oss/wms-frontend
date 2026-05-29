import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

type Props = {
  code: string;
  barcode: string;
  disabled?: boolean;
};

export const useGetBarcodeMI = ({ code, barcode, disabled = false }: Props) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["check-barcode-manifest-inbound", code, barcode],
    queryFn: async () => {
      const body = {
        code_document: code,
        old_barcode_product: barcode,
      };

      const res = await axios.request({
        method: "post",
        url: `${baseUrl}/scanner-bast`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify(body),
      });
      return res;
    },
    enabled: !!code && !!barcode && !disabled,
  });
  return query;
};
