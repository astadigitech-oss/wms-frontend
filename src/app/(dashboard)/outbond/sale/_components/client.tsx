"use client";

import { PlusCircle, ReceiptText, RefreshCcw, RefreshCw } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useGetListSale } from "../_api/use-get-list-sale";
import Pagination from "@/components/pagination";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import DialogSync from "./dialog-sync";
import { useCreateSync } from "../_api/use-create-sync";
import { format } from "date-fns";

export const Client = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

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
  } = useGetListSale({ p: page, q: searchValue });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // load data
  const loading = isLoading || isRefetching || isPending;

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

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleClose = () => setIsDialogOpen(false);

  const { mutate: mutateCreate } = useCreateSync();

  const handleSync = (dateRange: { start_date: Date; end_date: Date }) => {
    const body = {
      start_date: dateRange.start_date.toISOString().split("T")[0],
      end_date: dateRange.end_date.toISOString().split("T")[0],
    };
    mutateCreate({ body }, { onSuccess: handleClose });
  };

  // column data
  const columnListSale: ColumnDef<any>[] = [
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
      accessorKey: "code_document_sale",
      header: "Barcode",
    },
    {
      accessorKey: "buyer_name_document_sale",
      header: "Buyer",
    },
    {
      accessorKey: "total_product_document_sale",
      header: () => <div className="text-center">Qty</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {row.original.total_product_document_sale.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "price_after_tax",
      header: "Price",
      cell: ({ row }) => formatRupiah(row.original.price_after_tax),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => (
        <div className="">
          {format(new Date(row.original.created_at), "iii, dd MMM yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "approved",
      header: () => <div className="text-center">Approved</div>,
      cell: ({ row }) => (
        <div className="flex justify-center items-center">
          <Badge
            className={cn(
              "rounded-full text-black shadow-none",
              row.original.approved === "1"
                ? "bg-yellow-300 hover:bg-yellow-300 font-normal"
                : row.original.approved === "2"
                ? "bg-sky-300 hover:bg-sky-300 font-normal"
                : "bg-transparent hover:bg-transparent font-normal text-sm"
            )}
          >
            {row.original.approved === "1"
              ? "Pending"
              : row.original.approved === "2"
              ? "Done"
              : "-"}
          </Badge>
        </div>
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
              <Link href={`/outbond/sale/detail/${row.original.id}`}>
                <ReceiptText className="w-4 h-4" />
              </Link>
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
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Sale</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Sale</h2>
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
                <Button
                  asChild
                  className="hidden items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                  onClick={handleOpenDialog} // Call to open the dialog
                >
                  <div>
                    <RefreshCcw className={"w-4 h-4 mr-1"} />
                    Sync
                  </div>
                </Button>
                <DialogSync
                  open={isDialogOpen}
                  onCloseModal={handleClose}
                  isDirty={isDirty}
                  setIsDirty={setIsDirty}
                  handleSync={handleSync}
                />
                <Button
                  asChild
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  <Link href={"/outbond/sale/create"}>
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                    Cashier
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <DataTable columns={columnListSale} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
