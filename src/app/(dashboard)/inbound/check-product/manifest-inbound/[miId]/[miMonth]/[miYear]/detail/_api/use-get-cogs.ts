import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetCogs = () => {
  const accessToken = getCookie("accessToken");

  return useQuery({
    queryKey: ["cogs"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/cogs-channels`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
};
