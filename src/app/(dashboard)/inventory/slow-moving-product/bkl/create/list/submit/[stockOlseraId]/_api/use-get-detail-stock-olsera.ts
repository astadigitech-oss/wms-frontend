import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetDetailStockReturOlsera = ({ id, destinationId }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-detail-stock-retur-olsera", id, destinationId],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/bkl/olsera/outgoing/${id}?destination_id=${destinationId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
