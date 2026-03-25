import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";
import { toast } from "sonner";

export const useGetSummaryCategory = ({ month, year }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["summary-by-category", { month, year }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/summary-by-category?month=${month}&year=${year}`,
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
              "failed to submit to get summary by category"
            } `
          );
        }
      },
    },
  });
  return query;
};
