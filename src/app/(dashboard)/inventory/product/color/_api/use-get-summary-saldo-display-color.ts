import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetSummarySaldoDisplayColor = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["summary-saldo-display-color"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/movement/display-color/saldo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
