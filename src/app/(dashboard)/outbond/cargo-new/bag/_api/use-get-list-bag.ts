import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListBag = ({ p, q }: { p: number; q: string }) => {
  const accessToken = getCookie("accessToken");

  const query = useQuery({
    queryKey: ["cargo-new-list-bag", { p, q }],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/bag?page=${p}&q=${q}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });

  return query;
};
