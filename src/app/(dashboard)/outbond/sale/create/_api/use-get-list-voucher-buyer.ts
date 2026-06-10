import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetListVoucherBuyer = ({ id, q, p, enabled = true }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-voucher-buyer", id, { q, p }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/list-voucher-buyer/${id}?page=${p}&q=${q}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    enabled: !!id && enabled,
  });
  return query;
};
