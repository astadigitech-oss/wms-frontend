import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetStorageReport = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["storage-report"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/dashboard/storage-report`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
