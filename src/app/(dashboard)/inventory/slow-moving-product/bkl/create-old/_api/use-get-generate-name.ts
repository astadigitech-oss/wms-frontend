import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetGenerateNameBKL = () => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["generate-name-bkl"],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/bkl-documents/generate-code`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
