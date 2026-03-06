"use client";

import {
  FileDown,
  Loader,
  Loader2,
  PlusCircle,
  ReceiptText,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn, formatRupiah } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { parseAsInteger, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useGetListQCD } from "../_api/use-get-list-qcd";
import Pagination from "@/components/pagination";
import Link from "next/link";
import { useExportQcd } from "../_api/use-export-qcd";
import { useExportAllQcd } from "../_api/use-export-all-qcd";

export const Client = () => {
  // data search, page
  const [exportId, setExportId] = useState<number | null>(null);
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
  } = useGetListQCD({ p: page, q: searchValue });

  const { mutate: mutateExportQcd, isPending: isPendingQcd } = useExportQcd(
    exportId ?? 0,
  );
  const { mutate: mutateExportAllQcd, isPending: isPendingExportAllQcd } =
    useExportAllQcd();

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const handleExport = (id: number) => {
    setExportId(id);
    mutateExportQcd(
      { id },
      {
        onSuccess: (res) => {
          const url = res.data.data.resource?.download_url;
          const link = document.createElement("a");
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
      },
    );
  };

  const handleExportAll = async () => {
    mutateExportAllQcd(undefined, {
      onSuccess: (res) => {
        const link = document.createElement("a");
        link.href = res.data.data.resource.download_url;
        link.target = "_blank"; // opsional
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  // load data
  const loading = isLoading || isRefetching || isPending;

  // get pagetination
  useEffect(() => {
    if (isSuccess && data) {
      setPage(data?.data.data.resource.current_page);
      setMetaPage({
        last: data?.data.data.resource.last_page ?? 1,
        from: data?.data.data.resource.from ?? 0,
        total: data?.data.data.resource.total ?? 0,
        perPage: data?.data.data.resource.per_page ?? 0,
      });
    }
  }, [data]);

  // column data
  const columnListQCD: ColumnDef<any>[] = [
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
      accessorKey: "code_document_scrap",
      header: "Code Document",
      cell: ({ row }) => row.original.code_document_scrap,
    },
    {
      accessorKey: "total_product",
      header: "Total Product",
      cell: ({ row }) => (
        <div className="max-w-[400px] break-all">
          {row.original.total_product}
        </div>
      ),
    },
    {
      accessorKey: "total_new_price||total_old_price",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(
            row.original.total_new_price ?? row.original.total_old_price,
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="max-w-[400px] break-all">{row.original.status}</div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Detail</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              asChild
            >
              <Link href={`/outbond/qcd/detail/${row.original.id}`}>
                <ReceiptText className="w-4 h-4" />
              </Link>
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Export</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              onClick={() => handleExport(row.original.id)}
              disabled={isPendingQcd}
            >
              {isPendingQcd ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
            </Button>
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
          <BreadcrumbItem>Outbound</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>QCD</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List QCD</h2>
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
              <div className="flex gap-4 items-center ml-auto">
                <TooltipProviderPage value={"Export Data"} side="left">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleExportAll();
                    }}
                    className="items-center flex-none h-9 px-0 w-9 bg-sky-100 border border-sky-400 hover:bg-sky-200 text-black disabled:opacity-100 disabled:hover:bg-sky-200 disabled:pointer-events-auto disabled:cursor-not-allowed"
                    disabled={isPendingExportAllQcd}
                    variant={"outline"}
                  >
                    {isPendingExportAllQcd ? (
                      <Loader2 className={"w-4 h-4 animate-spin"} />
                    ) : (
                      <FileDown className={"w-4 h-4"} />
                    )}
                  </Button>
                </TooltipProviderPage>
                <Button
                  asChild
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  <Link href={"/outbond/qcd/create"}>
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                    Create
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="w-full h-[78vh] flex justify-center items-center">
              <Loader className="size-6 animate-spin" />
            </div>
          ) : (
            <div>
              <DataTable
                columns={columnListQCD}
                data={dataList ?? []}
                isLoading={isLoading || isRefetching}
              />
              <Pagination
                pagination={{ ...metaPage, current: page }}
                setPagination={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
