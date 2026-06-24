import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";
import { toast } from "sonner";

type RequestType = {
  documentId: string | number;
  body: {
    channel_id: string;
  };
};

type Error = AxiosError;

export const useSetCogs = () => {
  const accessToken = getCookie("accessToken");

  return useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ documentId, body }) => {
      const res = await axios.post(
        `${baseUrl}/attach-cogs-sku/${documentId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },
    onSuccess: () => {
      toast.success("COGS successfully updated");
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error("Error 403: Restricted Access");
      } else {
        toast.error(`ERROR ${err?.status}: COGS failed to update`);
        console.log("ERROR_SET_COGS:", err);
      }
    },
  });
};
