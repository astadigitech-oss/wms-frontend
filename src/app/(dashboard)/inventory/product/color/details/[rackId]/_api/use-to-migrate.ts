import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { baseUrl } from "@/lib/baseUrl";
import { toast } from "sonner";
import { getCookie } from "cookies-next/client";
import { invalidateQuery } from "@/lib/query";
import { useRouter } from "next/navigation";

type RequestType = {
  id: string;
};
type Error = AxiosError;

export const useToMigrate = () => {
  const accessToken = getCookie("accessToken");
  const queryClient = useQueryClient();
  const router = useRouter();
  const mutation = useMutation<AxiosResponse, Error, RequestType>({
    mutationFn: async ({ id }) => {
      const res = await axios.put(
        `${baseUrl}/color-racks/${id}/to-migrate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return res;
    },
    onSuccess: () => {
      toast.success("successfully updated rack to migrate");
      invalidateQuery(queryClient, [["list-detail-rack-color"]]);
      invalidateQuery(queryClient, [["list-racks-color"]]);
      router.push("/inventory/product/color");
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error(`Error 403: Restricted Access`);
      } else {
        console.log(err);
        toast.error(
          `ERROR ${err?.status}: ${
            (err as any)?.response?.data.message ||
            "Rack failed update to migrate"
          }`,
        );
        console.log("ERROR_UPDATE_TO_MIGRATE:", err);
      }
    },
  });
  return mutation;
};
