import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetDetailProductHistory = ({ id, p, q }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["detail-manifest-inbound-sku-history", id, { p, q }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/sku/batch/${id}?page=${p}&q=${q}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },
    enabled: !!id,
  });
  return query;
};
