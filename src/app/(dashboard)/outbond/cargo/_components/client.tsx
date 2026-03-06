"use client";

import { FileDown, Filter, Pencil, PlusCircle, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { parseAsInteger, useQueryState } from "nuqs";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useGetListCargo } from "../_api/use-get-list-b2b";

export const Client = () => {
  const router = useRouter();

  // data search, page
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  // get data utama
  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListCargo({ p: page, q: searchValue });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // load data
  const loading = isLoading || isRefetching || isPending;

  // get pagetination
  useEffect(() => {
    setPaginate({
      isSuccess,
      data,
      dataPaginate: data?.data.data.resource,
      setPage,
      setMetaPage,
    });
  }, [data]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  // column data
  const columnCargo: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPage.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "code_document_bulky",
      header: "Code Document",
    },
    {
      accessorKey: "name_document",
      header: "Name Document",
    },
    {
      accessorKey: "total_product_bulky",
      header: () => <div className="text-center">Total Product</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {row.original.total_product_bulky}
        </div>
      ),
    },
    {
      accessorKey: "total_old_price_bulky",
      header: () => <div className="text-center">Total Old Price</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {formatRupiah(row.original.total_old_price_bulky)}
        </div>
      ),
    },
    {
      accessorKey: "status_bulky",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded w-20 px-0 justify-center text-black font-normal capitalize",
              row.original.status_bulky.toLowerCase() === "selesai"
                ? "bg-green-400 hover:bg-green-400"
                : "bg-yellow-400 hover:bg-yellow-400",
            )}
          >
            {row.original.status_bulky}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "status_so_text",
      header: "Status SO",
      cell: ({ row }) => {
        const status = row.original.status_so_text;
        return (
          <Badge
            className={cn(
              "shadow-none font-normal rounded-full capitalize text-black",
              status === "Sudah SO" && "bg-green-400/80 hover:bg-green-400/80",
              status === "Belum SO" && "bg-red-400/80 hover:bg-red-400/80",
            )}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Edit</p>}>
            {row.original.status_bulky.toLowerCase() !== "selesai" && (
              <Button
                className="items-center w-9 px-0 flex-none h-9 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50"
                variant={"outline"}
                onClick={() =>
                  router.push(`/outbond/cargo/edit/${row.original.id}`)
                }
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  // loading
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
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Cargo</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full grid grid-cols-2 gap-4">
        {/* Card 1 */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Sale Offline</h3>
          </div>

          <div className="mt-1">
            <div className="text-xl font-semibold">{formatRupiah(5000000)}</div>

            <p className="text-sm text-gray-600 mt-1">
              Qty: <span className="font-medium">100</span>
            </p>
          </div>
        </div>
        {/* Card 2 */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Sale Online</h3>
          </div>

          <div className="mt-1">
            <div className="text-xl font-semibold">{formatRupiah(5000000)}</div>

            <p className="text-sm text-gray-600 mt-1">
              Qty: <span className="font-medium">100</span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Cargo</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full justify-between">
            <div className="flex items-center gap-3 w-full">
              <Input
                className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                value={dataSearch}
                onChange={(e) => setDataSearch(e.target.value)}
                placeholder="Search..."
                autoFocus
              />
              <TooltipProviderPage value={"Reload Data"}>
                <Button
                  onClick={() => refetch()}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant={"outline"}
                >
                  <RefreshCw
                    className={cn("w-4 h-4", loading ? "animate-spin" : "")}
                  />
                </Button>
              </TooltipProviderPage>
            </div>
            <Button variant={"liquid"} asChild>
              <Link href="/outbond/cargo/create">
                <FileDown className="size-4" />
                Export
              </Link>
            </Button>
            <Button variant={"liquid"} asChild>
              <Link href="/outbond/cargo/create">
                <Filter className="size-4" />
                Filter
              </Link>
            </Button>
            <Button variant={"liquid"} asChild>
              <Link href="/outbond/cargo/create">
                <PlusCircle className="size-4" />
                Create Cargo
              </Link>
            </Button>
          </div>
          <DataTable
            columns={columnCargo}
            data={dataList ?? []}
            isLoading={isLoading}
          />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
