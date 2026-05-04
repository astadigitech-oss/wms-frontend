import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListHistoryRackColor = ({ p, q, from, to }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-history-rack-color", { p, q, from, to }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/color-racks/history?page=${p}&q=${q}&from=${from}&to=${to}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },
  });
  return query;
};
