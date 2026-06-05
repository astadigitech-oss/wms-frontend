import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { invalidateQuery, useMutate } from "@/lib/query";

type Params = {
  id: string;
};

export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutate<undefined, Params>({
    endpoint: "/new_products/:id",
    method: "delete",
    onSuccess: () => {
      toast.success("Product successfully Deleted");
      invalidateQuery(queryClient, [["list-product-display"]]);
    },
    onError: {
      message: "Product failed to delete",
      title: "DELETE_PRODUCT",
    },
  });
  return mutation;
};
