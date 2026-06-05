import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetSummarySaldoStagging = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["summary-saldo-stagging"],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/movement/staging/saldo`,
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
