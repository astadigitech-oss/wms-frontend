import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetStorageReport = ({ month, year }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["storage-report"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/dashboard/storage-report?month=${month}&year=${year}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
