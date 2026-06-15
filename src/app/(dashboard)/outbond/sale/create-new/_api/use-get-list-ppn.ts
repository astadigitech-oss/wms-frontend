import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListPPN = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-data-ppn"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/ppn`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
