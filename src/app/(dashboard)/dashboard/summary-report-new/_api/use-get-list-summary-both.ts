import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";
import { toast } from "sonner";

export const useGetListSummaryBoth = ({ q, date_from, date_to }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["list-summary-both", { q, date_from, date_to }],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/list-summary-both?q=${q}&date_from=${date_from}&date_to=${date_to}`,
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
              "failed to submit to get list summary Both"
            } `
          );
        }
      },
    },
  });
  return query;
};
