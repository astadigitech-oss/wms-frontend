import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrlApiBulky } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetCategoryBulky = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-categories-create-palet"],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrlApiBulky}/products/filter/categories`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
  });
  return query;
};
