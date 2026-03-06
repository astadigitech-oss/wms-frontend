import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetStatisticsStock = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["statics-stock"],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/statistics/stock`,
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
