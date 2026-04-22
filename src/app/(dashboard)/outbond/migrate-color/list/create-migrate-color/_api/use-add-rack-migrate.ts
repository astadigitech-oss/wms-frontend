import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

export const useAddRackMigrate = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await axios.post(`${baseUrl}/migrate-rack/add`, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["list-color-migrate"],
      });
    },
  });

  return mutation;
};