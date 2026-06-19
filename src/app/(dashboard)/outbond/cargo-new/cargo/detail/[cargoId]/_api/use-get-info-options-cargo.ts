import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { baseUrlApiBulky } from "@/lib/baseUrl";
import { getCookie } from "cookies-next/client";

const getAuthHeader = () => ({
  Authorization: `Bearer ${getCookie("accessToken")}`,
});

export const useGetBrandOptionsCargo = ({ enabled = true }: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["cargo-new-info-options", "brands"],
    enabled,
    queryFn: async () => {
      const res = await axios.get(`${baseUrlApiBulky}/products/filter/brands`, {
        headers: getAuthHeader(),
      });
      return res;
    },
  });
};

export const useGetCategoryOptionsCargo = ({
  enabled = true,
}: {
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["cargo-new-info-options", "categories"],
    enabled,
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrlApiBulky}/products/filter/categories`,
        {
          headers: getAuthHeader(),
        },
      );
      return res;
    },
  });
};

export const useGetConditionOptionsCargo = ({
  enabled = true,
}: {
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["cargo-new-info-options", "conditions"],
    enabled,
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrlApiBulky}/products/filter/conditions`,
        {
          headers: getAuthHeader(),
        },
      );
      return res;
    },
  });
};

export const useGetPackageConditionOptionsCargo = ({
  enabled = true,
}: {
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["cargo-new-info-options", "package-conditions"],
    enabled,
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrlApiBulky}/products/filter/statuses`,
        {
          headers: getAuthHeader(),
        },
      );
      return res;
    },
  });
};

export const useGetOriginOptionsCargo = ({ enabled = true }: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["cargo-new-info-options", "origins"],
    enabled,
    queryFn: async () => {
      const res = await axios.get(
        `${baseUrlApiBulky}/products/filter/warehouse`,
        {
          headers: getAuthHeader(),
        },
      );
      return res;
    },
  });
};
