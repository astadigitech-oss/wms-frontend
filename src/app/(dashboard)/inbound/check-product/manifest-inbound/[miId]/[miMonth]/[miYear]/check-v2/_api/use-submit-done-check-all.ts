import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";
import { useRouter } from "next/navigation";

type RequestType = {
  code_document: string;
};

type Error = AxiosError;

export const useSubmitDoneCheckAll = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async (value) => {
      const res = await axios.post(`${baseUrl}/historys`, value, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    },
    onSuccess: () => {
      toast.success("All Product Successfully Checked");
      queryClient.invalidateQueries({ queryKey: ["check-history"] });
      router.push("/inbound/check-history");
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        toast.error(
          `ERROR ${err?.status}: ${
            (err.response?.data as any)?.errors?.code_document?.[0]
          }`
        );
        console.log("ERROR_DONE_CHECK_ALL:", err);
      }
    },
  });
  return mutation;
};
