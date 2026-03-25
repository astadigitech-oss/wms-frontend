import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";
import { toast } from "sonner";

export const useGetSummaryBalance = ({ month, year }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["summary-balance", { month, year }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/summary-balance?month=${month}&year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res;
    },
    meta: {
      onError: (err: any) => {
        if (err?.response?.status === 403) {
          toast.error("Error 403: Restricted Access");
        } else {
          toast.error(
            `ERROR ${err?.status}: ${
              (err.response?.data as any).data.message ||
              "failed to submit to get summary balance"
            } `
          );
        }
      },
    },
  });
  return query;
};
