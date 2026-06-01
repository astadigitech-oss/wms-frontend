import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getCookie } from "cookies-next/client";

import { baseUrl } from "@/lib/baseUrl";

export const useGetSummarySaldo = () => {
  const accessToken = getCookie("accessToken");

  return useQuery({
    queryKey: ["summary-saldo"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/movement/saldo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return res;
    },
  });
};
