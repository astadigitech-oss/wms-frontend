import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";
import { toast } from "sonner";
import { format } from "date-fns";

export const useGetSummaryBeginBalance = (date?: string) => {
  const accessToken = getCookie("accessToken");
  const finalDate = date ?? format(new Date(), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["summary-begin-balance", finalDate],
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrl}/summary-begin-balance?date=${finalDate}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res.data;
    },
    meta: {
      onError: (err: any) => {
        if (err?.response?.status === 403) {
          toast.error("Error 403: Restricted Access");
        } else {
          toast.error(
            err?.response?.data?.message ||
              "Failed to get summary begin balance",
          );
        }
      },
    },
  });
};
