import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListBuyer = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-buyer-cargo"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/buyers`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
