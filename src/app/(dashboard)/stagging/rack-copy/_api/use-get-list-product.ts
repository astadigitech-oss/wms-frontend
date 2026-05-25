import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

type Props = {
  p?: number;
  q?: string;
  rack_status?: "null" | "not_null" | "";
};

export const useGetListProduct = ({
  p,
  q,
  rack_status,
}: Props) => {
  const accessToken = getCookie("accessToken");

  const query = useQuery({
    queryKey: [
      "list-product-staging",
      {
        p,
        q,
        rack_status,
      },
    ],

    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/staging_products`,
        {
          params: {
            page: p,
            q: q,
            ...(rack_status && {
              rack_status,
            }),
          },
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