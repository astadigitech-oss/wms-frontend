import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next/client";

import { useQueryClient } from "@tanstack/react-query";
import { invalidateQuery, useMutate } from "@/lib/query";

interface LoginBody {
  email_or_username: string;
  password: string;
}

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutate<LoginBody>({
    endpoint: "/login",
    method: "post",
    onSuccess: (res) => {
      toast.success("Login Success");
      setCookie("accessToken", res.data.data.resource[0]);
      setCookie("profile", JSON.stringify(res.data.data.resource[1]));
      invalidateQuery(queryClient, [["storage-report"], ["count-staging"], ["list-summary-both"]]);
      router.push("/");
    },
    onError: {
      message: "Email/username or password not match",
      title: "LOGIN",
    },
    isNotAuthorize: true,
  });

  return mutation;
};
