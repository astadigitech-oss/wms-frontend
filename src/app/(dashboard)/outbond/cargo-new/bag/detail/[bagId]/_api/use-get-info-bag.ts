import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetInfoBag = ({ id }: any) => {
  const accessToken = getCookie("accessToken");

  const query = useQuery({
    queryKey: ["cargo-new-info-bag", { id }],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/bag/${id}/info`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    enabled: !!id,
  });

  return query;
};
