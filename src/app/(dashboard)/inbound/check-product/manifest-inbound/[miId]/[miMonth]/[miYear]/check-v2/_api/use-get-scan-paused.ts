import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetScanPaused = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["scan-paused"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/scan-paused`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
