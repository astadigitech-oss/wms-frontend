import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: number; // ⬅ bulky document id
  body: {
    buyer_id: number;
    discount_bulky: number;
  };
};

type ErrorType = AxiosError;

export const useCreateSale = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, ErrorType, RequestType>({
    mutationFn: async ({ id, body }) => {
      const formData = new FormData();

      formData.append("buyer_id", String(body.buyer_id));
      formData.append("discount_bulky", String(body.discount_bulky));

      const res = await axios.post(
        `${baseUrl}/bulky-documents/${id}/sale`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return res;
    },

    onSuccess: () => {
      toast.success("Sale successfully created");

      // refetch detail bulky document
      queryClient.invalidateQueries({
        queryKey: ["detail-bulky-document"],
      });

      // optional kalau ada list
      queryClient.invalidateQueries({
        queryKey: ["list-bulky-document"],
      });
       queryClient.invalidateQueries({
        queryKey: ["list-cargo"],
      });
    },

    onError: (err) => {
      const status = err.response?.status;

      if (status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        toast.error(`Error ${status}: Sale failed`);
        console.log("ERROR_CREATE_SALE:", err.response);
      }
    },
  });

  return mutation;
};