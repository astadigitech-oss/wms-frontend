"use client";

import {
  Filter,
  Loader2,
  MoreVertical,
  Package,
  Pencil,
  PlusCircle,
  ReceiptText,
  RefreshCw,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
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
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import dynamic from "next/dynamic";
import { useConfirm } from "@/hooks/use-confirm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useScanSODocument } from "../_api/use-scan-so-document";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeleteCargo } from "../_api/use-delete-cargo";
import { useExportDetailDataCargo } from "../_api/use-export-detail-data-cargo";
import { useGetListCargo } from "../_api/use-get-list-cargo";
import { useGetDetailCargo } from "../_api/use-get-detail-cargo";
import { useGetSummarySales } from "../_api/use-get-summary-sales";
import { DialogVolume } from "./dialog-volume";
import { DialogBuyerDiscount } from "./dialog-buyer-discount";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DialogDetail = dynamic(() => import("./dialog-detail"), {
  ssr: false,
});

export const Client = () => {
  const router = useRouter();
  const [openDetail, setOpenDetail] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false),
  );
  const [type, setType] = useQueryState("type", parseAsString.withDefault(""));
  const [cargoId, setCargoId] = useQueryState("CargoId", { defaultValue: "" });
  const [soDocumentInput, setSODocumentInput] = useState("");
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openVolume, setOpenVolume] = useState(false);
  const [volumeData, setVolumeData] = useState<any>({});
  const [openBuyerDiscount, setOpenBuyerDiscount] = useState(false);
  const [buyerDiscountData, setBuyerDiscountData] = useState<any>({});
  // donfirm delete
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Cargo",
    "This action cannot be undone",
    "destructive",
  );

  const [SoCargoDialog, confirmSoCargo] = useConfirm(
    "SO Rack Stagging",
    "This action cannot be undone",
    "liquid",
  );

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

  // mutate delete
  const { mutate: mutateDelete, isPending: isPendingDelete } = useDeleteCargo();
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportDetailDataCargo();
  const { mutate: mutateScanSO, isPending: isPendingScanSO } =
    useScanSODocument();

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
  } = useGetListCargo({ p: page, q: searchValue, type });

  // get data summary sales
  const {
    data: dataSummarySales,
    // refetch: refetchSummarySales,
    // isLoading: isLoadingSummarySales,
    // isRefetching: isRefetchingSummarySales,
    error: errorSummarySales,
    isError: isErrorSummarySales,
  } = useGetSummarySales();

  // get data utama
  const {
    data: dataDetail,
    refetch: refetchDetail,
    isLoading: isLoadingDetail,
    isRefetching: isRefetchingDetail,
    error: errorDetail,
    isError: isErrorDetail,
  } = useGetDetailCargo({ id: cargoId });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // memo data detail
  const dataListDetail: any[] = useMemo(() => {
    return dataDetail?.data.data.resource.bulky_sales;
  }, [dataDetail]);

  // memo data detail
  const dataSummary: any = useMemo(() => {
    return dataSummarySales?.data.data.resource || {};
  }, [dataSummarySales]);

  // memo data red detail
  const dataResDetail: any = useMemo(() => {
    return dataDetail?.data.data.resource;
  }, [dataDetail]);

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
      isError: isErrorSummarySales,
      error: errorSummarySales as AxiosError,
      data: "Summary Sales Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorSummarySales, errorSummarySales]);

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete();
    if (!ok) return;

    mutateDelete({ id });
  };

  // handle export
  const handleExport = async () => {
    mutateExport(
      { id: cargoId },
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

  // handle scan SO Document
  const handleScanSODocument = (e: FormEvent) => {
    e.preventDefault();
    if (!soDocumentInput.trim()) return;
    const title = `SO Cargo code document ${soDocumentInput}`;

    (async () => {
      const ok = await confirmSoCargo(title);
      if (!ok) return;

      mutateScanSO(
        { code_document: soDocumentInput },
        {
          onSuccess: () => {
            setSODocumentInput("");
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
    })();
  };

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
      header: () => <div className="text-center">Qty</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {row.original.total_product_bulky}
        </div>
      ),
    },
    {
      accessorKey: "total_old_price_bulky",
      header: () => <div className="text-center">Old Price</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {formatRupiah(row.original.total_old_price_bulky)}
        </div>
      ),
    },
    {
      accessorKey: "after_price_bulky",
      header: () => <div className="text-center">New Price</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {formatRupiah(row.original.after_price_bulky)}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: () => <div className="text-center">Type</div>,
      cell: ({ row }) => {
        const typeValue = row.original.type;
        const isCargoOnline = typeValue?.toLowerCase() === "cargo online";

        const displayType = typeValue?.replace(/cargo\s*/i, "");

        return (
          <div className="flex justify-center">
            <Badge
              className={cn(
                "rounded w-20 px-0 justify-center text-black font-normal capitalize",
                !typeValue
                  ? "bg-gray-300 hover:bg-gray-300"
                  : isCargoOnline
                    ? "bg-blue-400 hover:bg-blue-400"
                    : "bg-purple-400 hover:bg-purple-400",
              )}
            >
              {displayType || "null"}
            </Badge>
          </div>
        );
      },
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
      accessorKey: "is_sale",
      header: () => <div className="text-center">Status Sale</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded w-20 px-0 justify-center text-black font-normal capitalize",
              row.original.is_sale.toLowerCase() === "sale"
                ? "bg-green-400 hover:bg-green-400"
                : row.original.is_sale.toLowerCase() === "not sale"
                  ? "bg-gray-300 hover:bg-gray-300"
                  : "bg-yellow-400 hover:bg-yellow-400",
            )}
          >
            {row.original.is_sale}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => {
        const data = row.original;

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-9 h-9 px-0 border-sky-400 text-sky-700 hover:bg-sky-50"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">
                {/* Volume */}
                {data.type?.toLowerCase() === "cargo online" &&
                  data.is_sale?.toLowerCase() !== "sale" && (
                    <DropdownMenuItem
                      className="text-indigo-700 hover:bg-indigo-50"
                      onClick={() => {
                        setVolumeData(data);
                        setOpenVolume(true);
                      }}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Volume
                    </DropdownMenuItem>
                  )}

                {/* Edit */}
                {data.status_bulky.toLowerCase() !== "selesai" && (
                  <DropdownMenuItem
                    className="text-yellow-700 hover:bg-yellow-50"
                    onClick={() =>
                      router.push(`/outbond/cargo/edit/${data.id}`)
                    }
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}

                {/* Detail */}
                <DropdownMenuItem
                  className="text-sky-700 hover:bg-sky-50"
                  onClick={() =>
                    router.push(`/outbond/cargo/detail/${data.id}`)
                  }
                >
                  <ReceiptText className="w-4 h-4 mr-2" />
                  Detail
                </DropdownMenuItem>

                {/* Sale */}
                {data.is_sale.toLowerCase() !== "sale" && (
                  <DropdownMenuItem
                    className="text-emerald-700 hover:bg-emerald-50"
                    onClick={() => {
                      setBuyerDiscountData(data);
                      setOpenBuyerDiscount(true);
                    }}
                  >
                    <ShoppingBasket className="w-4 h-4 mr-2" />
                    Sale
                  </DropdownMenuItem>
                )}

                {/* Delete */}
                <DropdownMenuItem
                  className="text-red-600 hover:bg-red-50"
                  disabled={isPendingDelete}
                  onClick={() => handleDelete(data.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
    // {
    //   accessorKey: "action",
    //   header: () => <div className="text-center">Action</div>,
    //   cell: ({ row }) => (
    //     <div className="flex gap-4 justify-center items-center">
    //       <TooltipProviderPage value={<p>Online</p>}>
    //         {row.original.type?.toLowerCase() === "cargo online" &&
    //           row.original.is_sale?.toLowerCase() !== "sale" && (
    //             <Button
    //               variant="outline"
    //               className="w-9 h-9 px-0 border-indigo-400 text-indigo-700 hover:bg-indigo-50"
    //               onClick={() => {
    //                 setVolumeData(row.original);
    //                 setOpenVolume(true);
    //               }}
    //             >
    //               <Package className="w-4 h-4" />
    //             </Button>
    //           )}
    //       </TooltipProviderPage>
    //       <TooltipProviderPage value={<p>Edit</p>}>
    //         {row.original.status_bulky.toLowerCase() !== "selesai" && (
    //           <Button
    //             className="items-center w-9 px-0 flex-none h-9 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50"
    //             variant={"outline"}
    //             onClick={() =>
    //               router.push(`/outbond/cargo/edit/${row.original.id}`)
    //             }
    //           >
    //             <Pencil className="w-4 h-4" />
    //           </Button>
    //         )}
    //       </TooltipProviderPage>
    //       <TooltipProviderPage value={<p>Detail</p>}>
    //         <Button
    //           className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
    //           variant={"outline"}
    //           // disabled={isLoadingDetail}
    //           // onClick={(e) => {
    //           //   e.preventDefault();
    //           //   setCargoId(row.original.id);
    //           //   setOpenDetail(true);
    //           // }}
    //           onClick={() =>
    //             router.push(`/outbond/cargo/detail/${row.original.id}`)
    //           }
    //         >
    //           {/* {isLoadingDetail ? (
    //             <Loader2 className="w-4 h-4 animate-spin" />
    //           ) : ( */}
    //           <ReceiptText className="w-4 h-4" />
    //           {/* // )} */}
    //         </Button>
    //       </TooltipProviderPage>

    //       <TooltipProviderPage value={<p>Delete</p>}>
    //         <Button
    //           className="items-center w-9 px-0 hidden flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
    //           variant={"outline"}
    //           disabled={isPendingDelete}
    //           onClick={(e) => {
    //             e.preventDefault();
    //             handleDelete(row.original.id);
    //           }}
    //         >
    //           {isPendingDelete ? (
    //             <Loader2 className="w-4 h-4 animate-spin" />
    //           ) : (
    //             <Trash2 className="w-4 h-4" />
    //           )}
    //         </Button>
    //       </TooltipProviderPage>
    //       <TooltipProviderPage value={<p>Sale</p>}>
    //         {row.original.is_sale.toLowerCase() !== "sale" && (
    //           <Button
    //             variant="outline"
    //             className="w-9 h-9 px-0 border-emerald-400 text-emerald-700 hover:bg-emerald-50"
    //             onClick={() => {
    //               setBuyerDiscountData(row.original);
    //               setOpenBuyerDiscount(true);
    //             }}
    //           >
    //             <ShoppingBasket className="w-4 h-4" />
    //           </Button>
    //         )}
    //       </TooltipProviderPage>
    //     </div>
    //   ),
    // },
  ];
  // column data detail
  const columnCargoDetail: ColumnDef<any>[] = [
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
      accessorKey: "barcode_bulky_sale",
      header: "Barcode",
    },
    {
      accessorKey: "name_product_bulky_sale",
      header: () => <div className="text-center">Product Name</div>,
      cell: ({ row }) => (
        <div className="max-w-[400px] break-all">
          {row.original.name_product_bulky_sale}
        </div>
      ),
    },
    {
      accessorKey: "product_category_bulky_sale",
      header: "Category",
    },
    {
      accessorKey: "old_price_bulky_sale",
      header: "Price",
      cell: ({ row }) => formatRupiah(row.original.old_price_bulky_sale),
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
      <DeleteDialog />
      <SoCargoDialog />
      <DialogBuyerDiscount
        open={openBuyerDiscount}
        onOpenChange={() => setOpenBuyerDiscount(false)}
        data={buyerDiscountData}
        setData={setBuyerDiscountData}
      />
      <DialogVolume
        open={openVolume}
        onOpenChange={() => setOpenVolume(false)}
        data={volumeData}
      />
      <DialogDetail
        open={openDetail} // open modal
        onCloseModal={() => {
          if (openDetail) {
            setOpenDetail(false);
            setCargoId("");
          }
        }} // handle close modal
        data={dataResDetail}
        isLoading={isLoadingDetail}
        refetch={refetchDetail}
        isRefetching={isRefetchingDetail}
        columns={columnCargoDetail}
        dataTable={dataListDetail ?? []}
        isPendingExport={isPendingExport}
        handleExport={handleExport}
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

          <div className="mt-2 space-y-1 text-sm">
            <p>
              Old Price :{" "}
              <span className="font-medium">
                {formatRupiah(dataSummary?.cargo_offline?.total_old_price || 0)}
              </span>
            </p>

            <p>
              New Price :{" "}
              <span className="font-semibold text-green-600">
                {formatRupiah(dataSummary?.cargo_offline?.total_price || 0)}
              </span>
            </p>

            <p>
              Qty :{" "}
              <span className="font-medium">
                {dataSummary?.cargo_offline?.qty || 0}
              </span>
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Sale Online</h3>
          </div>

          <div className="mt-2 space-y-1 text-sm">
            <p>
              Old Price :{" "}
              <span className="font-medium">
                {formatRupiah(dataSummary?.cargo_online?.total_old_price || 0)}
              </span>
            </p>

            <p>
              New Price :{" "}
              <span className="font-semibold text-green-600">
                {formatRupiah(dataSummary?.cargo_online?.total_price || 0)}
              </span>
            </p>

            <p>
              Qty :{" "}
              <span className="font-medium">
                {dataSummary?.cargo_online?.qty || 0}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
        <h3 className="text-lg font-semibold">SO Document Disini</h3>
        <form onSubmit={handleScanSODocument} className="flex flex-col gap-3">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Scan Code Document
              </label>
              <Input
                type="text"
                className="border-sky-400/80 focus-visible:ring-sky-400"
                value={soDocumentInput}
                onChange={(e) => setSODocumentInput(e.target.value)}
                placeholder="Scan Code Document here..."
                disabled={isPendingScanSO}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="bg-sky-400 hover:bg-sky-400/80 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isPendingScanSO || !soDocumentInput.trim()}
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
            <div className="w-40">
              <Select
                value={type}
                onValueChange={(value) => {
                  setPage(1); // reset ke page 1
                  setType(value === "all" ? "" : value);
                }}
              >
                <SelectTrigger className="h-9">
                  <Filter className="size-4" />

                  <SelectValue placeholder="Filter Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="cargo online">Online</SelectItem>
                  <SelectItem value="cargo offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
