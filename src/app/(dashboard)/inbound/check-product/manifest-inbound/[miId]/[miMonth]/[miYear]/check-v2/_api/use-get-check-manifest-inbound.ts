import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useGetCheckManifestInbound = ({ code }: any) => {
  const accessToken = getCookie("accessToken");
  const query = useQuery({
    queryKey: ["check-manifest-inbound", code],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/documents?q=${code}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
  });
  return query;
};
