import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";

type RequestType = {
  id: string;
};

type Error = AxiosError;

export const useDeleteCargo = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.delete(`${baseUrl}/bulky-documents/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Cargo successfully Deleted");
      queryClient.invalidateQueries({ queryKey: ["list-cargo"] });
    },
    onError: (err) => {
      console.log("ERROR DELETE CARGO:", err);
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else if (err.status === 400) {
        const message =
          err?.response &&
          err.response.data &&
          typeof err.response.data === "object" &&
          "data" in err.response.data &&
          err.response.data.data &&
          typeof err.response.data.data === "object" &&
          "message" in err.response.data.data
            ? err.response.data.data.message
            : "Bad Request";
        toast.error(`ERROR ${err?.status}: ${message}`);
      } else {
        toast.error(`ERROR ${err?.status}: ${err.message}`);
        console.log("ERROR_DELETE_CARGO:", err);
      }
    },
  });
  return mutation;
};
