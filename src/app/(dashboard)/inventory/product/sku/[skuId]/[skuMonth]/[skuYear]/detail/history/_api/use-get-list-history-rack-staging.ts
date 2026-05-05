import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListHistoryBundling = ({ code_documents, p, q }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-history-bundling-sku", { code_documents,p, q }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/sku-products/history-bundling?code_document=${code_documents}&page=${p}&q=${q}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
  });
  return query;
};
