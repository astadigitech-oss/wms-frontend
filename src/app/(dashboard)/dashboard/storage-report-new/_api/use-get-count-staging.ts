import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetCountStaging = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["count-staging"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/countStaging`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
