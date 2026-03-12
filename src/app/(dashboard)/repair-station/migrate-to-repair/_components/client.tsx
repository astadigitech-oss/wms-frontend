"use client";

import {
  Edit3,
  Loader2,
  PlusCircle,
  ReceiptText,
  Recycle,
  RefreshCw,
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
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useGetListMigrateToRepair } from "../_api/use-get-list-migrate-to-repair";
import { useGetDetailMigrateToRepair } from "../_api/use-get-detail-migrate-to-repair";
import DialogDetail from "./dialog-detail";
import { DialogToEdit } from "./dialog-to-edit";
import { DialogToDisplay } from "./dialog-to-display";
import { useConfirm } from "@/hooks/use-confirm";
import { useToQcd } from "../_api/use-to-qcd";
import { useScanSOProduct } from "../_api/use-scan-so-product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// const DialogDetail = dynamic(() => import("./dialog-detail"), {
//   ssr: false,
// });

export const Client = () => {
  const [SOProductInput, setSOProductInput] = useState("");
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // sheet detail
  const [openDetail, setOpenDetail] = useQueryState(
    "dialog",
    parseAsString.withDefault(""),
  );

  const [productId, setProductId] = useQueryState(
    "id",
    parseAsString.withDefault(""),
  );

  // MigrateToRepairId for detail
  const [MigrateToRepairId, setMigrateToRepairId] = useQueryState(
    "MigrateToRepairId",
    {
      defaultValue: "",
    },
  );

  const [DialogDryScrap, confirmToQcd] = useConfirm(
    "To Qcd Product Migrate To Repair",
    "This action cannot be undone",
    "destructive",
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

  // mutate
  const { mutate: mutateToQcd, isPending: isPendingToQcd } = useToQcd();
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
  } = useGetListMigrateToRepair({ p: page, q: searchValue });

  // get detail data
  const {
    data: dataMigrateToRepair,
    isLoading: isLoadingMigrateToRepair,
    refetch: refetchMigrateToRepair,
    isRefetching: isRefetchingMigrateToRepair,
    isError: isErrorMigrateToRepair,
    error: errorMigrateToRepair,
  } = useGetDetailMigrateToRepair({ id: MigrateToRepairId });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // load data
  const loading = isLoading || isRefetching || isPending;

  // memo product detail list
  const dataListDetail: any[] = useMemo(() => {
    return dataMigrateToRepair?.data.data.resource.migrate_bulky_products;
  }, [dataMigrateToRepair]);

  // memo product detail list
  const dataMetaDetail: any = useMemo(() => {
    return dataMigrateToRepair?.data.data.resource;
  }, [dataMigrateToRepair]);

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
      isError: isErrorMigrateToRepair,
      error: errorMigrateToRepair as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorMigrateToRepair, errorMigrateToRepair]);

  const handleToQcd = async (id: any) => {
    const ok = await confirmToQcd();

    if (!ok) return;
    mutateToQcd({ id });
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

  // handle close
  const handleClose = () => {
    setOpenDetail("");
    setMigrateToRepairId("");
  };

  // column data
  const columnListMigrateToRepair: ColumnDef<any>[] = [
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
      accessorKey: "name_user",
      header: "User",
    },
    {
      accessorKey: "code_document",
      header: "Code Document",
    },
    {
      accessorKey: "status_bulky",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge className="rounded bg-sky-400/80 hover:bg-sky-400/80 text-black font-medium capitalize">
            {row.original.status_bulky}
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
              onClick={(e) => {
                e.preventDefault();
                setOpenDetail("detail");
                setMigrateToRepairId(row.original.id);
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
  const columnMigrateToRepairDetail: ColumnDef<any>[] = [
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
      accessorKey: "code_document",
      header: "Document Code",
    },
    {
      accessorKey: "new_barcode_product",
      header: "Barcode",
    },
    {
      accessorKey: "new_name_product",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[400px] break-all">
          {row.original.new_name_product}
        </div>
      ),
    },
    {
      header: "Description",
      accessorKey: "new_quality",
      cell: ({ row }) => {
        let desc = "-";

        try {
          const quality = JSON.parse(row.original.new_quality);
          desc = quality?.migrate ?? "-";
        } catch {
          desc = "-";
        }

        return <div className="max-w-[300px] break-all capitalize">{desc}</div>;
      },
    },
    {
      accessorKey: "new_category_product",
      header: "Category",
    },
    {
      accessorKey: "display_price",
      header: "Price",
      cell: ({ row }) => formatRupiah(row.original.display_price),
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
          <TooltipProviderPage value={<p>Edit</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-100 disabled:hover:bg-yellow-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                setOpenDetail("detail-to-edit");
                setProductId(row.original.id);
              }}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Detail</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                setOpenDetail("detail-to-display");
                setProductId(row.original.id);
              }}
            >
              <ReceiptText className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>To Qcd</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              onClick={() => {
                handleToQcd(row.original.id);
              }}
              disabled={isPendingToQcd}
            >
              <Recycle className="w-4 h-4" />
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
      <DialogDryScrap />
      <DialogDetail
        open={openDetail === "detail"}
        onCloseModal={() => {
          if (openDetail === "detail") {
            handleClose();
          }
        }}
        data={dataMetaDetail}
        isLoading={isLoadingMigrateToRepair}
        refetch={refetchMigrateToRepair}
        isRefetching={isRefetchingMigrateToRepair}
        columns={columnMigrateToRepairDetail}
        dataTable={dataListDetail ?? []}
      />
      <DialogToEdit
        open={openDetail === "detail-to-edit"}
        onOpenChange={() => {
          if (openDetail === "detail-to-edit") {
            setOpenDetail("detail");
            setProductId("");
          }
        }}
        productId={productId}
      />
      <DialogToDisplay
        open={openDetail === "detail-to-display"}
        onOpenChange={() => {
          if (openDetail === "detail-to-display") {
            setOpenDetail("detail");
            setProductId("");
          }
        }}
        productId={productId}
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
          <BreadcrumbItem>Migrate To Repair</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className=" w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col hidden md:flex-row">
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
                // disabled={isPendingScanSO}
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
        <h2 className="text-xl font-bold">List Migrate To Repair</h2>
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
                  <Link href={"/repair-station/migrate-to-repair/create"}>
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                    New Migrate
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <DataTable
            columns={columnListMigrateToRepair}
            data={dataList ?? []}
            isLoading={loading}
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
