import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useAddProduct = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await axios.post(`${baseUrl}/bkl/scan`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["list-detail-bkl"],
      });
    },
  });

  return mutation;
};