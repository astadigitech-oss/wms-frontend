import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: number; // ⬅ bulky document id
  body: {
    weight: string;
    height: string;
    width: string;
    length: string;
  };
};

type ErrorType = AxiosError;

export const useUpdateCargoOnline = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, ErrorType, RequestType>({
    mutationFn: async ({ id, body }) => {
      const formData = new FormData();

      formData.append("weight", String(body.weight));
      formData.append("height", String(body.height));
      formData.append("width", String(body.width));
      formData.append("length", String(body.length));

      const res = await axios.post(
        `${baseUrl}/bulky-documents/${id}/ready-online`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
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
    },

    onError: (err) => {
      const status = err.response?.status;

      if (status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        console.log("ERROR_UPDATE_CARGO_ONLINE:", err);
        const message =
          err?.response &&
          err.response.data &&
          typeof err.response.data === "object" &&
          "data" in err.response.data &&
          typeof (err.response.data as Record<string, unknown>).data === "object" &&
          "message" in ((err.response.data as Record<string, unknown>).data as Record<string, unknown>)
            ? ((err.response.data as Record<string, unknown>).data as Record<string, unknown>).message
            : "Failed to update cargo online";
        toast.error(`ERROR ${err?.status}: ${message}`);
        console.log("ERROR_UPDATE_CARGO_ONLINE:", err);
      }
    },
  });

  return mutation;
};
