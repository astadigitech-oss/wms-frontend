import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetSelect = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-select-migrate-color"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/colorDestination`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
