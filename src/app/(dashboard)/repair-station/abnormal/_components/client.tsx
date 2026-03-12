"use client";

import { FileDown, Loader2, RefreshCw, ShoppingBag } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
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
import Pagination from "@/components/pagination";
import dynamic from "next/dynamic";
import { useGetListCategories } from "../_api/use-get-list-categories";
import { useToDisplay } from "../_api/use-to-display";
import { useQueryClient } from "@tanstack/react-query";
import { useGetListABN } from "../_api/use-get-list-abnormal";
import { useGetDetailABN } from "../_api/use-get-detail-abnormal";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useExportProductAbnormal } from "../_api/use-export-product-abnormal";
import { toast } from "sonner";
import { useScanSOProduct } from "../_api/use-scan-so-product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DialogDetail = dynamic(() => import("./dialog-detail"), {
  ssr: false,
});

export const Client = () => {
  const queryClient = useQueryClient();
  const [openDisplay, setOpenDisplay] = useState(false);
  const [documentDetail, setDocumentDetail] = useState({
    barcode: "",
  });
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [SOProductInput, setSOProductInput] = useState("");
  const [input, setInput] = useState({
    barcode: "",
    oldBarcode: "",
    name: "",
    oldName: "",
    price: "0",
    oldPrice: "0",
    qty: "1",
    oldQty: "1",
    category: "",
    new_tag_product: "",
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

  // donfirm delete
  // const [DeleteDialog, confirmDelete] = useConfirm(
  //   "QCD LPR",
  //   "This action cannot be undone",
  //   "destructive"
  // );

  // mutate DELETE, UPDATE, CREATE
  // const { mutate: mutateDelete, isPending: isPendingDelete } = useDeleteABN();
  const { mutate: mutateToDisplay, isPending: isPendingToDisplay } =
    useToDisplay();
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportProductAbnormal();
  const { mutate: mutateScanSO, isPending: isPendingScanSO } =
    useScanSOProduct();

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
  } = useGetListABN({ p: page, q: searchValue });

  // get data detail
  const {
    data: dataDetail,
    isLoading: isLoadingDetail,
    error: errorDetail,
    isError: isErrorDetail,
    isSuccess: isSuccessDetail,
  } = useGetDetailABN({
    barcode: documentDetail.barcode,
  });

  // get data category
  const {
    data: dataCategory,
    error: errorCategory,
    isError: isErrorCategory,
  } = useGetListCategories();

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // memo data detail
  const dataResDetail: any = useMemo(() => {
    return dataDetail?.data.data.resource;
  }, [dataDetail]);

  // memo data detail
  const dataResColorDetail: any = useMemo(() => {
    return dataDetail?.data.data.resource.color_tags?.[0];
  }, [dataDetail]);

  // memo data category
  const dataCategories: any[] = useMemo(() => {
    return dataCategory?.data.data.resource ?? [];
  }, [dataCategory]);
  const isExtra = Boolean(dataDetail?.data.data.resource?.is_extra);

  useEffect(() => {
    if (isSuccessDetail && dataDetail) {
      const dataResponse = dataDetail?.data.data.resource;
      setInput({
        barcode: dataResponse?.new_barcode_product ?? "",
        name: dataResponse?.new_name_product ?? "",
        price: dataResponse?.new_price_product ?? "0",
        qty: dataResponse?.new_quantity_product ?? "1",
        oldBarcode: dataResponse?.old_barcode_product ?? "",
        oldName: dataResponse?.new_name_product ?? "",
        oldPrice: dataResponse?.old_price_product ?? "0",
        oldQty: dataResponse?.new_quantity_product ?? "1",
        category: dataResponse?.new_category_product ?? "",
        new_tag_product: dataResponse?.new_tag_product ?? "",
      });
    }
  }, [dataDetail]);

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

  useEffect(() => {
    alertError({
      isError: isErrorDetail,
      error: errorDetail as AxiosError,
      data: "Detail Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorDetail, errorDetail]);

  useEffect(() => {
    alertError({
      isError: isErrorCategory,
      error: errorCategory as AxiosError,
      data: "Category Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorCategory, errorCategory]);

  // handle delete
  // const handleDelete = async (id: any, source: any) => {
  //   const ok = await confirmDelete();

  //   if (!ok) return;

  //   mutateDelete({ id, source });
  // };

  const handleExport = async () => {
    mutateExport("", {
      onSuccess: (res) => {
        const link = document.createElement("a");
        link.href = res.data.data.resource;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  const handleToDisplay = () => {
    const body = {
      old_barcode_product: input.oldBarcode,
      old_price_product: input.oldPrice,
      new_status_product: dataResDetail?.new_status_product,
      new_barcode_product: input.barcode,
      new_name_product: input.name,
      new_price_product: input.price,
      new_quantity_product: input.qty,
      new_category_product: input.category ?? null,
      new_tag_product: input.new_tag_product ?? null,
      is_extra: isExtra,
    };
    mutateToDisplay(
      { id: dataResDetail?.id, source: dataResDetail?.source, body },
      {
        onSuccess: () => {
          toast.success("Successfully updated to display");
          queryClient.invalidateQueries({
            queryKey: ["list-abn"],
          });
          setOpenDisplay(false);
        },
      },
    );
  };

  // handle scan SO Barang
  const handleScanSOProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!SOProductInput.trim()) return;

    mutateScanSO(
      { barcode: SOProductInput },
      {
        onSuccess: () => {
          setSOProductInput("");
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message ||
            error?.response?.data?.data?.message ||
            "Barang gagal di-SO";

          setErrorMessage(message);
          setOpenErrorDialog(true);
        },
      },
    );
  };

  // default numeric
  useEffect(() => {
    if (isNaN(parseFloat(input.price))) {
      setInput((prev) => ({ ...prev, price: "0" }));
    }
    if (isNaN(parseFloat(input.qty))) {
      setInput((prev) => ({ ...prev, qty: "0" }));
    }
  }, [input]);

  // column data
  const columnWarehousePalet: ColumnDef<any>[] = [
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
      accessorKey: "old_barcode_product||new_barcode_product",
      header: "Barcode",
      cell: ({ row }) =>
        row.original.new_barcode_product || row.original.old_barcode_product,
    },
    {
      accessorKey: "new_name_product",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.new_name_product}
        </div>
      ),
    },
    {
      accessorKey: "new_category_product||new_tag_product",
      header: "Category",
      cell: ({ row }) =>
        row.original.new_category_product ??
        row.original.new_tag_product ??
        "-",
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => row.original.source,
    },
    {
      accessorKey: "new_price_product||old_price_product",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(
            row.original.new_price_product ?? row.original.old_price_product,
          )}
        </div>
      ),
    },
    {
      accessorKey: "new_date_in_product",
      header: "Date",
      cell: ({ row }) => (
        <div className="">
          {format(
            new Date(row.original.new_date_in_product),
            "iii, dd MMM yyyy",
          )}
        </div>
      ),
    },
    {
      accessorKey: "new_status_product",
      header: "Status",
      cell: ({ row }) => (
        <Badge className="bg-green-400/80 hover:bg-green-400/80 font-normal rounded-full text-black capitalize">
          {row.original.new_status_product}
        </Badge>
      ),
    },
    // {
    //   accessorKey: "status_so",
    //   header: "Status SO",
    //   cell: ({ row }) => {
    //     const status = row.original.status_so;
    //     return (
    //       <Badge
    //         className={cn(
    //           "shadow-none font-normal rounded-full capitalize text-black",
    //           status === "Sudah SO" && "bg-green-400/80 hover:bg-green-400/80",
    //           status === "Belum SO" && "bg-red-400/80 hover:bg-red-400/80",
    //         )}
    //       >
    //         {status}
    //       </Badge>
    //     );
    //   },
    // },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>To Display</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingToDisplay}
              onClick={(e) => {
                e.preventDefault();
                setOpenDisplay(true);
                setDocumentDetail({
                  barcode: row.original.new_barcode_product,
                });
              }}
            >
              <ShoppingBag className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
          {/* <TooltipProviderPage value={<p>QCD</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingToDisplay || isPendingDelete}
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id, row.original.source);
              }}
            >
              {isPendingDelete ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Recycle className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage> */}
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
      {/* <DeleteDialog /> */}
      <DialogDetail
        open={openDisplay}
        handleClose={() => {
          if (openDisplay) {
            setOpenDisplay(false);
            setInput({
              barcode: "",
              oldBarcode: "",
              name: "",
              oldName: "",
              price: "0",
              oldPrice: "0",
              qty: "1",
              oldQty: "1",
              category: "",
              new_tag_product: "",
            });
          }
        }}
        isLoading={isLoadingDetail}
        data={dataResDetail}
        dataColor={dataResColorDetail}
        isSubmit={isPendingToDisplay}
        input={input}
        setInput={setInput}
        categories={dataCategories}
        handleSubmit={handleToDisplay}
      />
      <Dialog open={openErrorDialog} onOpenChange={setOpenErrorDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">SO Gagal</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700">{errorMessage}</div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setOpenErrorDialog(false)}
              className="bg-sky-400 hover:bg-sky-400/80 text-black"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Repair Station</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>List Product Abnormal</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="hidden w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 flex-col">
        <h3 className="text-lg font-semibold">SO Barang Disini</h3>
        <form onSubmit={handleScanSOProduct} className="flex flex-col gap-3">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Scan Barcode
              </label>
              <Input
                type="text"
                className="border-sky-400/80 focus-visible:ring-sky-400"
                value={SOProductInput}
                onChange={(e) => setSOProductInput(e.target.value)}
                placeholder="Scan barcode here..."
                disabled={isPendingScanSO}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="bg-sky-400 hover:bg-sky-400/80 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isPendingScanSO || !SOProductInput.trim()}
            >
              {isPendingScanSO ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "SO"
              )}
            </Button>
          </div>
        </form>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Product Abnormal</h2>
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
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleExport();
                }}
                className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                disabled={isPendingExport}
                variant={"outline"}
              >
                {isPendingExport ? (
                  <Loader2 className={"w-4 h-4 mr-1 animate-spin"} />
                ) : (
                  <FileDown className={"w-4 h-4 mr-1"} />
                )}
                Export Data
              </Button>
            </div>
          </div>
          <DataTable
            columns={columnWarehousePalet}
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
