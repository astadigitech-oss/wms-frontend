import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListColorMigrate = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-color-migrate"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/displayMigrate`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
