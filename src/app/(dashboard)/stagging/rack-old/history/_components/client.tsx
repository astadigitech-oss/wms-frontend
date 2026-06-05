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
import { Button } from "@/components/ui/button";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { usePagination } from "@/lib/pagination";
import { useSearch } from "@/lib/search";
import { InputSearch } from "@/components/input-search";
import { FileDown, Loader2 } from "lucide-react";
import { useExportHistoryRackStaging } from "../_api/use-export-rack-history-staging";
import { useGetListHistoryRackStaging } from "../_api/use-get-list-history-rack-staging";
import { columnHistoryRackStagging } from "./columns";

export const Client = () => {
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportHistoryRackStaging();
  const { page, metaPage, setPage, setPagination } = usePagination("pFilter");
  const { search, searchValue, setSearch } = useSearch();

  const { data, refetch, error, isSuccess, isError, isRefetching, isPending } =
    useGetListHistoryRackStaging({
      p: page,
      q: searchValue,
    });

  const isLoading = isPendingExport || isRefetching || isPending;

  const dataListHistoryRack: any[] = useMemo(() => {
    return data?.data.data.details.data;
  }, [data]);
  const totalInputAllUsers = useMemo(() => {
    return data?.data.data.total_all_users;
  }, [data]);

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data?.data.data.details);
    }
  }, [data, isSuccess]);

  const handleExport = async () => {
    mutateExport("", {
      onSuccess: (res) => {
        const link = document.createElement("a");
        link.href = res.data.data.resource.download_url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  if (isError && (error as AxiosError)?.status === 403) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 py-4">
      <div className="flex flex-col gap-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Display</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/stagging/rack">
                Rack
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>History Rack</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
          <h3 className="text-lg font-semibold">List History</h3>
          <div className="flex gap-4 items-center w-full">
            <div className="h-9 px-4 flex items-center rounded-md justify-center border gap-1 border-sky-500 bg-sky-100">
              Total input all users:{" "}
              <span className="font-semibold">{totalInputAllUsers}</span>
            </div>
          </div>

          <div className="flex gap-4 items-center w-full">
            <InputSearch
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari history rack..."
              onClick={() => refetch()}
              loading={isRefetching}
              disabled={isPending}
            />
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleExport();
              }}
              type="button"
              className="bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isPendingExport}
            >
              {isPendingExport ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 mr-2" />
              )}
              Export
            </Button>
          </div>
          <DataTable
            isSticky
            columns={columnHistoryRackStagging({
              metaPage,
              isLoading,
            })}
            data={dataListHistoryRack ?? []}
          />
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
