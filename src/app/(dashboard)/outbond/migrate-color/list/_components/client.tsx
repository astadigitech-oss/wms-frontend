"use client";

import { PlusCircle, ReceiptText, RefreshCw } from "lucide-react";
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
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useGetListMigrateColor } from "../_api/use-get-list-migrate-color";
import Pagination from "@/components/pagination";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { useGetDetailMigrateColor } from "../_api/use-get-detail-migrate-color";
import { useExportDetailMigrateColor } from "../_api/use-export-detail-migrate-color";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetStatisticsStock } from "../_api/use-get-statistik-stock";

const DialogDetail = dynamic(() => import("./dialog-detail"), {
  ssr: false,
});

export const Client = () => {
  // sheet detail
  const [openDetail, setOpenDetail] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false),
  );

  // migrateColorId for detail
  const [migrateColorId, setMigrateColorId] = useQueryState("migrateColorId", {
    defaultValue: "",
  });

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

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportDetailMigrateColor();

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
  } = useGetListMigrateColor({ p: page, q: searchValue });

  // get detail data
  const {
    data: dataMigrateColor,
    isLoading: isLoadingMigrateColor,
    refetch: refetchMigrateColor,
    isRefetching: isRefetchingMigrateColor,
    isError: isErrorMigrateColor,
    error: errorMigrateColor,
  } = useGetDetailMigrateColor({ id: migrateColorId });

  // get data statictics stock
  const {
    data: dataStatisticsStock,
    // isLoading: isLoadingStatisticsStock,
    // refetch: refetchStatisticsStock,
    // isRefetching: isRefetchingStatisticsStock,
    // isError: isErrorStatisticsStock,
    // error: errorStatisticsStock,
  } = useGetStatisticsStock();

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // load data
  const loading = isLoading || isRefetching || isPending;

  // memo product detail list
  const dataListDetail: any[] = useMemo(() => {
    return dataMigrateColor?.data.data.resource.migrates;
  }, [dataMigrateColor]);

  // memo product detail list
  const dataMetaDetail: any = useMemo(() => {
    return dataMigrateColor?.data.data.resource;
  }, [dataMigrateColor]);

  // memo statistics stock
  const dataStatisticsStockMemo: any = useMemo(() => {
    return dataStatisticsStock?.data.data.resource;
  }, [dataStatisticsStock]);

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

  useEffect(() => {
    alertError({
      isError: isErrorMigrateColor,
      error: errorMigrateColor as AxiosError,
      data: "Detail Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorMigrateColor, errorMigrateColor]);

  // handle close
  const handleClose = () => {
    setOpenDetail(false);
    setMigrateColorId("");
  };

  // handle export
  const handleExport = async () => {
    mutateExport(
      { id: migrateColorId },
      {
        onSuccess: (res) => {
          const link = document.createElement("a");
          link.href = res.data.data.resource;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
      },
    );
  };

  // column data
  const columnListMigrateColor: ColumnDef<any>[] = [
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
      accessorKey: "code_document_migrate",
      header: "Migrate Document",
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) =>
        format(new Date(row.original.created_at), "iiii, dd MMMM yyyy"),
    },
    {
      accessorKey: "total_product_document_migrate",
      header: () => <div className="text-center">Qty</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.total_product_document_migrate.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "destiny_document_migrate",
      header: "Destination",
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
              onClick={(e) => {
                e.preventDefault();
                setOpenDetail(true);
                setMigrateColorId(row.original.id);
              }}
            >
              <ReceiptText className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  // column data detail
  const columnMigrateColorDetail: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(1 + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "product_color",
      header: "Product Color",
    },
    {
      accessorKey: "product_total",
      header: () => <div className="text-center">Qty</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.product_total.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "status_migrate",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Badge className="rounded text-black font-normal capitalize bg-green-400/80 hover:bg-green-400/80">
            {row.original.status_migrate.split("_").join(" ")}
          </Badge>
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
      <DialogDetail
        open={openDetail}
        onCloseModal={() => {
          if (openDetail) {
            handleClose();
          }
        }}
        data={dataMetaDetail}
        isLoading={isLoadingMigrateColor}
        refetch={refetchMigrateColor}
        isRefetching={isRefetchingMigrateColor}
        columns={columnMigrateColorDetail}
        dataTable={dataListDetail ?? []}
        isPendingExport={isPendingExport}
        handleExport={handleExport}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Migrate Color</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>List</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h2 className="text-xl font-bold">Statistics Stock</h2>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ================= PRODUCT STICKER ================= */}
        <Card className="bg-white rounded-md shadow border-0">
          <CardHeader>
            <CardTitle>Product Sticker</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            {/* GRAND TOTAL */}
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Quantity</p>
                <p className="text-lg font-semibold">
                  {dataStatisticsStockMemo?.product_sticker?.grand_total_qty?.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-lg font-semibold">
                  {formatRupiah(
                    dataStatisticsStockMemo?.product_sticker
                      ?.grand_total_value || 0,
                  )}
                </p>
              </div>
            </div>

            {/* DETAILS PER COLOR */}
            <div className="flex flex-col gap-2 border-t pt-4">
              {Object.entries(
                dataStatisticsStockMemo?.product_sticker?.details_per_color ||
                  {},
              ).map(([color, detail]: any) => (
                <div key={color} className="flex justify-between text-sm py-1">
                  <div className="capitalize font-medium">{color}</div>
                  <div className="text-right">
                    <div>{detail.qty.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {formatRupiah(detail.total_value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ================= BKL PRODUCTS ================= */}
        <Card className="bg-white rounded-md shadow border-0">
          <CardHeader>
            <CardTitle>BKL Products</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Quantity</p>
                <p className="text-lg font-semibold">
                  {dataStatisticsStockMemo?.bkl_products?.grand_total_qty?.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-lg font-semibold">
                  {formatRupiah(
                    dataStatisticsStockMemo?.bkl_products?.grand_total_value ||
                      0,
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t pt-4">
              {Object.entries(
                dataStatisticsStockMemo?.bkl_products?.details_per_color || {},
              ).map(([color, detail]: any) => (
                <div key={color} className="flex justify-between text-sm py-1">
                  <div className="capitalize font-medium">{color}</div>
                  <div className="text-right">
                    <div>{detail.qty.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {formatRupiah(detail.total_value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ================= OLSERA STOCK ================= */}
        <Card className="bg-white rounded-md shadow border-0">
          <CardHeader>
            <CardTitle>Olsera Stock</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Quantity</p>
                <p className="text-lg font-semibold">
                  {dataStatisticsStockMemo?.olsera_stock?.grand_total_qty?.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-lg font-semibold">
                  {formatRupiah(
                    dataStatisticsStockMemo?.olsera_stock?.grand_total_value ||
                      0,
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t pt-4">
              {Object.entries(
                dataStatisticsStockMemo?.olsera_stock?.details_per_category ||
                  {},
              ).map(([category, detail]: any) => (
                <div
                  key={category}
                  className="flex justify-between text-sm py-1"
                >
                  <div className="font-medium">{category}</div>
                  <div className="text-right">
                    <div>{detail.qty.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {formatRupiah(detail.total_value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Migrate</h2>
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
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  <Link href={"/outbond/migrate-color/list/create"}>
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                    New Migrate
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <DataTable columns={columnListMigrateColor} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
