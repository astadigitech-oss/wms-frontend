import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

type Props = {
  p?: number;
  q?: string;
  status?: string;
};

export const useGetApproval = ({ p, q = "", status = "" }: Props) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["approval", { p, q, status }],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/list-voucher-approval`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: p,
          q,
          status,
        },
      });
      return res;
    },
  });

  return query;
};
