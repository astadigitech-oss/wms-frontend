import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrlApiBulky } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListCategoryCargo = ({ q }: { q: string }) => {
  const accessToken = getCookie("accessToken");

  const query = useQuery({
    queryKey: ["cargo-new-list-category-cargo", { q }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrlApiBulky}/products/filter/categories?q=${q}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },
    enabled: false,
  });

  return query;
};
