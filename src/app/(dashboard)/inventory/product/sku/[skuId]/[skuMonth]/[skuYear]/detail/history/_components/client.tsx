"use client";

import { useEffect, useMemo, useState } from "react";
import { alertError } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { usePagination } from "@/lib/pagination";
import { useSearch } from "@/lib/search";
import { InputSearch } from "@/components/input-search";
import { columnHistoryBundle } from "./columns";

/* DATE PICKER */
import { useGetListHistoryBundling } from "../_api/use-get-list-history-rack-staging";
import { useParams } from "next/navigation";

export const Client = () => {
  const { skuId, skuMonth, skuYear } = useParams();
  const codeDocument = `${skuId}/${skuMonth}/${skuYear}`;
  const { page, metaPage, setPage, setPagination } = usePagination("pFilter");
  const { search, searchValue, setSearch } = useSearch();

  // /* ================= PARAMS ================= */
  // const params = useMemo(() => {
  //   return {
  //     p: page,
  //     q: searchValue,
  //     from: date?.from ? format(date.from, "yyyy-MM-dd") : "",
  //     to: date?.to ? format(date.to, "yyyy-MM-dd") : "",
  //   };
  // }, [page, searchValue, date]);

  /* ================= API ================= */
  const {
    data,
    refetch,
    error,
    isSuccess,
    isError,
    isRefetching,
    isPending,
    isLoading: isLoadingRack,
  } = useGetListHistoryBundling({
    code_documents: codeDocument,
    p: page,
    q: searchValue,
  });

  const dataListHistoryRack: any[] = useMemo(() => {
    return data?.data.data?.resource.data;
  }, [data]);

  const isLoading = isRefetching || isPending || isLoadingRack;

  /* ================= PAGINATION ================= */
  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data?.data?.data?.resource);
    }
  }, [data, isSuccess]);

  /* RESET PAGE SAAT FILTER BERUBAH */
  useEffect(() => {
    setPage(1);
  }, []);

  /* AUTO REFETCH */
  useEffect(() => {
    refetch();
  }, []);

  /* ================= EXPORT ================= */
  // const handleExport = async () => {
  //   mutateExport(
  //     {
  //       searchParams: {
  //         from: date?.from ? format(date.from, "yyyy-MM-dd") : "",
  //         to: date?.to ? format(date.to, "yyyy-MM-dd") : "",
  //       },
  //     },
  //     {
  //       onSuccess: (res) => {
  //         const link = document.createElement("a");
  //         link.href = res.data.data.resource.download_url;
  //         document.body.appendChild(link);
  //         link.click();
  //         document.body.removeChild(link);
  //       },
  //     }
  //   );
  // };

  /* ================= ERROR ================= */
  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  /* ================= MOUNT ================= */
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <Loading />;

  if (isError && (error as AxiosError)?.status === 403) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full p-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full px-4 py-4">
      <div className="flex flex-col gap-4 w-full">
        {/* ================= BREADCRUMB ================= */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Inventory</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/inventory/product/sku">
                Product SKU
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/inventory/product/sku/${codeDocument}/detail`}
              >
                Detail
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>History</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* ================= CONTENT ================= */}
        <div className="flex w-full bg-white rounded-md shadow px-5 py-3 gap-4 flex-col">
          <h3 className="text-lg font-semibold">List History SKU</h3>

          {/* ================= FILTER ================= */}
          <div className="flex items-center gap-2 w-full">
            {/* SEARCH */}
            <InputSearch
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari history rack..."
              onClick={() => refetch()}
              loading={isRefetching}
              disabled={isPending}
            />
          </div>

          {/* ================= TABLE ================= */}
          <DataTable
            isSticky
            columns={columnHistoryBundle({
              metaPageHistoryBundling: metaPage,
              isLoading,
            })}
            data={dataListHistoryRack ?? []}
          />

          {/* ================= PAGINATION ================= */}
          <Pagination
            pagination={{
              ...metaPage,
              current: page,
            }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
