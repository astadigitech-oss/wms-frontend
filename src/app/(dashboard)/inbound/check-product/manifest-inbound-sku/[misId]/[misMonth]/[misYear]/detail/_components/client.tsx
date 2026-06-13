"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useQueryClient } from "@tanstack/react-query";
import { notFound, useParams } from "next/navigation";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useGetDetailManifestInboundSku } from "../_api/use-get-detail-manifest-inbound";
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Edit3,
  Loader2,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  ScanBarcode,
  Send,
} from "lucide-react";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { Button } from "@/components/ui/button";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import Loading from "@/app/(dashboard)/loading";
import { AxiosError } from "axios";
import { toast } from "sonner";
import Forbidden from "@/components/403";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProduct } from "../_api/use-update-product";
import { useRollbackProduct } from "../_api/use-rollback-product";
import { useGetDetailProduct } from "../_api/use-get-detail-product";
import Pagination from "@/components/pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { useCheckFinishSku, useFinishSku } from "../_api/use-submit-doc-sku";
import { useGetDetailProductHistory } from "../_api/use-get-detail-product-history";
import { format } from "date-fns";

export const Client = () => {
  const { misId, misMonth, misYear } = useParams();
  const queryClient = useQueryClient();
  const [openEdit, setOpenEdit] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false),
  );
  const [openDetail, setOpenDetail] = useState(false);
  const [productId, setProductId] = useQueryState("productId", {
    defaultValue: "",
  });
  const [historyProductId, setHistoryProductId] = useState("");

  const [historyPage, setHistoryPage] = useState(1);

  const [historyMetaPage, setHistoryMetaPage] = useState({
    last: 1,
    from: 1,
    total: 1,
    perPage: 10,
  });

  const [historySearch, setHistorySearch] = useState("");
  const historySearchValue = useDebounce(historySearch);
  const [openFinishSku, setOpenFinishSku] = useState(false);
  const [finishSkuCheck, setFinishSkuCheck] = useState<any>(null);
  const [input, setInput] = useState({
    old_name_product: "",
    actual_quantity_product: "0",
    damaged_quantity_product: "0",
    note: "",
    // lost_quantity_product: "0",
  });
  const codeDocument = `${misId}/${misMonth}/${misYear}`;
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const [RollbackProductDialog, confirmRollbackProductDialog] = useConfirm(
    "Rollback Product",
    "This action cannot be undone",
    "liquid",
  );

  const { data, error, refetch, isError, isRefetching, isLoading, isSuccess } =
    useGetDetailManifestInboundSku({
      code: codeDocument,
      p: page,
      q: searchValue,
    });

  const {
    data: dataProduct,
    isLoading: isLoadingProduct,
    isSuccess: isSuccessProduct,
    isError: isErrorProduct,
    error: errorProduct,
  } = useGetDetailProduct({ id: productId });

  const {
    data: dataProductHistory,
    isLoading: isLoadingProductHistory,
    isRefetching: isRefetchingProductHistory,
    isError: isErrorProductHistory,
    error: errorProductHistory,
  } = useGetDetailProductHistory({
    id: historyProductId,
    p: historyPage,
    q: historySearchValue,
  });

  const { mutate: mutateUpdate, isPending: isPendingUpdate } =
    useUpdateProduct();
  const { mutate: mutateRollback, isPending: isPendingRollback } =
    useRollbackProduct();
  const { mutate: mutateCheckFinishSku, isPending: isPendingCheckFinishSku } =
    useCheckFinishSku();
  const { mutate: mutateFinishSku, isPending: isPendingFinishSku } =
    useFinishSku();
  const dataDetails = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);
  const dataDetailMI = dataDetails?.data.data;
  const statusMIS = dataDetails?.status;
  const documentId =dataDetails?.id;
  const finishSkuResource = finishSkuCheck?.data?.data?.resource;
  const finishSkuMessage = finishSkuCheck?.data?.data?.message;
  const dataProductHistoryResource = useMemo(() => {
    return dataProductHistory?.data?.data?.resource;
  }, [dataProductHistory]);

  const dataDetailProductHistory = useMemo(() => {
    return dataProductHistoryResource?.data || [];
  }, [dataProductHistoryResource]);

  const handleClose = () => {
    setOpenEdit(false);
    setProductId("");
    setInput({
      old_name_product: "",
      actual_quantity_product: "0",
      damaged_quantity_product: "0",
      note: "",
      // lost_quantity_product: "0",
    });
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setHistoryProductId("");
    setHistoryPage(1);
    setHistorySearch("");
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      actual_quantity_batch: input.actual_quantity_product,
      damaged_quantity_batch: input.damaged_quantity_product,
      note: input.note,
      // lost_quantity_product: input.lost_quantity_product,
    };
    mutateUpdate(
      { id: productId, body },
      {
        onSuccess: (data) => {
          handleClose();
          queryClient.invalidateQueries({
            queryKey: [
              "detail-manifest-inbound-sku",
              data.data.data.resource.id,
            ],
          });
        },
      },
    );
  };

  const handleRollback = async () => {
    const ok = await confirmRollbackProductDialog();

    if (!ok) return;

    const body = {
      actual_quantity_batch: input.actual_quantity_product,
      damaged_quantity_batch: input.damaged_quantity_product,
      note: input.note,
      // lost_quantity_product: input.lost_quantity_product,
    };

    mutateRollback(
      { id: productId, body },
      {
        onSuccess: (data) => {
          handleClose();
          queryClient.invalidateQueries({
            queryKey: [
              "detail-manifest-inbound-sku",
              data.data.data.resource.id,
            ],
          });
        },
      },
    );
  };

  const handleCheckFinishSku = () => {
    if (!documentId) {
      toast.error("Document ID not found");
      return;
    }

    mutateCheckFinishSku(
      { documentId },
      {
        onSuccess: (data) => {
          setFinishSkuCheck(data);
          setOpenFinishSku(true);
        },
      },
    );
  };

  const handleFinishSku = () => {
    if (!documentId) return;

    mutateFinishSku(
      { documentId },
      {
        onSuccess: () => {
          setOpenFinishSku(false);
          setFinishSkuCheck(null);
        },
      },
    );
  };

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccess,
      data: data,
      dataPaginate: data?.data.data.resource.data,
      setMetaPage: setMetaPage,
      setPage: setPage,
    });
  }, [data]);

  useEffect(() => {
    const resource = dataProductHistory?.data?.data?.resource;

    if (!resource) return;

    setHistoryMetaPage({
      last: resource.last_page || 1,
      from: resource.from || 1,
      total: resource.total || 0,
      perPage: resource.per_page || 10,
    });
  }, [dataProductHistory]);

  // isError get data
  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  // isError get data
  useEffect(() => {
    alertError({
      isError: isErrorProduct,
      error: errorProduct as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorProduct, errorProduct]);

  // isError get detail history
  useEffect(() => {
    alertError({
      isError: isErrorProductHistory,
      error: errorProductHistory as AxiosError,
      data: "Detail History",
      action: "get data",
      method: "GET",
    });
  }, [isErrorProductHistory, errorProductHistory]);

  useEffect(() => {
    if (isSuccessProduct && dataProduct) {
      return setInput({
        old_name_product: dataProduct.data.data.resource.old_name_product || "",
        actual_quantity_product:
          Math.round(
            dataProduct.data.data.resource.actual_quantity_product,
          ).toString() ?? "0",
        damaged_quantity_product:
          Math.round(
            dataProduct.data.data.resource.damaged_quantity_product,
          ).toString() ?? "0",
        note: dataProduct.data.data.resource.note || "",
        // lost_quantity_product:
        //   Math.round(
        //     dataProduct.data.data.resource.lost_quantity_product,
        //   ).toString() ?? "0",
      });
    }
  }, [dataProduct]);

  useEffect(() => {
    if (isNaN(parseFloat(input.actual_quantity_product))) {
      setInput((prev) => ({ ...prev, actual_quantity_product: "0" }));
    }
    if (isNaN(parseFloat(input.damaged_quantity_product))) {
      setInput((prev) => ({ ...prev, damaged_quantity_product: "0" }));
    }
    // if (isNaN(parseFloat(input.lost_quantity_product))) {
    //   setInput((prev) => ({ ...prev, lost_quantity_product: "0" }));
    // }
  }, [input]);

  const columnDetailHistory: ColumnDef<any>[] = [
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
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <div className="min-w-[180px] whitespace-nowrap">
          {row.original.code ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "actual_quantity_batch",
      header: "Lolos",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {row.original.actual_quantity_batch ?? 0}
        </div>
      ),
    },
    {
      accessorKey: "damaged_quantity_batch",
      header: "Damaged",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {row.original.damaged_quantity_batch ?? 0}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.type ?? "-"}</div>
      ),
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => (
        <div className="min-w-[220px] max-w-[360px] break-words">
          {row.original.note ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "created_by",
      header: "User",
      cell: ({ row }) => (
        <div className="min-w-[120px]">{row.original.created_by ?? "-"}</div>
      ),
    },
    {
      accessorKey: "time",
      header: "Time",
      cell: ({ row }) => (
        <div className="min-w-[160px] whitespace-nowrap">
          {row.original.time
            ? format(new Date(row.original.time), "yyyy-MM-dd HH:mm")
            : "-"}
        </div>
      ),
    },
  ];

  const columnSales: ColumnDef<any>[] = [
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
      accessorKey: "old_barcode_product",
      header: "Barcode",
    },
    {
      accessorKey: "old_name_product",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.old_name_product}
        </div>
      ),
    },
    {
      accessorKey: "old_price_product",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.old_price_product)}
        </div>
      ),
    },
    {
      accessorKey: "old_quantity_product",
      header: "Qty Awal",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.old_quantity_product}
        </div>
      ),
    },
    {
      accessorKey: "actual_quantity_product",
      header: "Qty Actual",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.actual_quantity_product}
        </div>
      ),
    },
    {
      accessorKey: "damaged_quantity_product",
      header: "Qty Damaged",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.damaged_quantity_product}
        </div>
      ),
    },
    {
      accessorKey: "lost_quantity_product",
      header: "Qty Lost",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.lost_quantity_product}
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
              disabled={
                isLoadingProductHistory && historyProductId === row.original.id
              }
              onClick={(e) => {
                e.preventDefault();

                setHistoryPage(1);
                setHistorySearch("");

                setHistoryProductId(row.original.id);
                setOpenDetail(true);
              }}
            >
              {isLoadingProductHistory &&
              historyProductId === row.original.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ReceiptText className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Edit</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-100 disabled:hover:bg-yellow-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={
                isLoadingProduct ||
                isPendingUpdate ||
                isPendingRollback ||
                statusMIS === "done"
              }
              onClick={(e) => {
                e.preventDefault();
                setProductId(row.original.id);
                setOpenEdit(true);
              }}
            >
              {isLoading || isPendingUpdate || isPendingRollback ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

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
  if (isError && (error as AxiosError)?.status === 404) {
    notFound();
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <RollbackProductDialog />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inbound</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Check Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <button
              type="button"
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["manifest-inbound"],
                })
              }
            >
              <BreadcrumbLink href="/inbound/check-product/manifest-inbound/">
                Manifest Inbound SKU
              </BreadcrumbLink>
            </button>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Detail</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
        <div className="flex items-center justify-between pb-3 mb-5 border-gray-500 border-b w-full">
          <div className="flex items-center gap-4">
            <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
              <ScanBarcode className="size-4" />
            </div>
            <h5 className="font-bold text-xl">
              {/* {dataRes?.code_document_sale} */}
            </h5>
          </div>
          <div className="flex gap-4 items-center">
            <TooltipProviderPage value={"Reload Data"}>
              <Button
                onClick={() => refetch()}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant={"outline"}
                disabled={isRefetching}
              >
                <RefreshCw
                  className={cn("w-4 h-4", isRefetching ? "animate-spin" : "")}
                />
              </Button>
            </TooltipProviderPage>
            <TooltipProviderPage value={"Check"} align="end">
              <Button
                disabled={
                  isPendingCheckFinishSku ||
                  isPendingFinishSku ||
                  statusMIS === "done" ||
                  !documentId
                }
                onClick={handleCheckFinishSku}
                className="items-center w-9 px-0 flex-none h-9 bg-sky-400/80 text-black hover:bg-sky-400"
              >
                {isPendingCheckFinishSku ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </TooltipProviderPage>
          </div>
        </div>
        <div className="flex w-full gap-4">
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col">
              <p className="text-sm">Code Document</p>
              <p className="font-semibold">
                {dataDetails?.code_document || ""}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm">Document Name</p>
              <p className="font-semibold">
                {dataDetails?.document_name || ""}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm">Total List Product</p>
              <p className="font-semibold">
                {dataDetails?.document_name || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List of Document Data</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full">
            <Input
              className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
              value={dataSearch}
              onChange={(e) => setDataSearch(e.target.value)}
              placeholder="Search..."
            />
            <TooltipProviderPage value={"Reload Data"}>
              <Button
                onClick={() => refetch()}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant={"outline"}
              >
                <RefreshCw
                  className={cn(
                    "w-4 h-4",
                    isLoading || isRefetching ? "animate-spin" : "",
                  )}
                />
              </Button>
            </TooltipProviderPage>
          </div>{" "}
          <DataTable
            isLoading={isRefetching || isLoading}
            columns={columnSales}
            data={dataDetailMI ?? []}
          />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
      <Dialog
        open={openFinishSku}
        onOpenChange={(open) => {
          setOpenFinishSku(open);
          if (!open) setFinishSkuCheck(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Finish SKU</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="rounded-md border border-sky-400/80 p-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold capitalize">
                  {finishSkuCheck?.data?.data?.status || "-"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-500">Message</p>
                <p className="font-semibold">{finishSkuMessage || "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border p-3">
                  <p className="text-sm text-gray-500">SKU Product Old</p>
                  <p className="text-lg font-bold tabular-nums">
                    {finishSkuResource?.product_old_count ?? 0}
                  </p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-sm text-gray-500">SKU Product</p>
                  <p className="text-lg font-bold tabular-nums">
                    {finishSkuResource?.product_sku_count ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex w-full gap-2 justify-end">
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                type="button"
                disabled={isPendingFinishSku}
                onClick={() => {
                  setOpenFinishSku(false);
                  setFinishSkuCheck(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="w-full sm:w-auto bg-sky-400/80 text-black hover:bg-sky-400"
                type="button"
                disabled={isPendingFinishSku || !documentId}
                onClick={handleFinishSku}
              >
                {isPendingFinishSku ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openEdit}
        onOpenChange={() => {
          handleClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="w-full flex flex-col gap-4">
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full">
                <Label>Product Name</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Category name..."
                  value={input.old_name_product}
                  disabled
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      old_name_product: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full relative">
                <Label>Qty Actual</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="0"
                  value={input.actual_quantity_product}
                  type="number"
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      actual_quantity_product: e.target.value.startsWith("0")
                        ? e.target.value.replace(/^0+/, "")
                        : e.target.value,
                    }))
                  }
                />
                <p className="absolute right-3 bottom-2 text-xs text-gray-400">
                  {parseFloat(input.actual_quantity_product) ?? "Rp 0"}
                </p>
              </div>
              <div className="flex flex-col gap-1 w-full relative">
                <Label>Qty Damaged</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="0"
                  value={input.damaged_quantity_product}
                  type="number"
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      damaged_quantity_product: e.target.value.startsWith("0")
                        ? e.target.value.replace(/^0+/, "")
                        : e.target.value,
                    }))
                  }
                />
                <p className="absolute right-3 bottom-2 text-xs text-gray-400">
                  {parseFloat(input.damaged_quantity_product) ?? "Rp 0"}
                </p>
              </div>
              {/* <div className="flex flex-col gap-1 w-full relative">
                <Label>Qty Lost</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="0"
                  value={input.lost_quantity_product}
                  type="number"
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      lost_quantity_product: e.target.value.startsWith("0")
                        ? e.target.value.replace(/^0+/, "")
                        : e.target.value,
                    }))
                  }
                />
                <p className="absolute right-3 bottom-2 text-xs text-gray-400">
                  {parseFloat(input.lost_quantity_product) ?? "Rp 0"}
                </p>
              </div> */}
              <div className="flex flex-col gap-1 w-full">
                <Label>Note</Label>
                <Textarea
                  className="border-sky-400/80 focus-visible:ring-0 focus-visible:border-sky-500"
                  placeholder="Note..."
                  value={input.note}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex w-full gap-2">
              <Button
                className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                onClick={(e) => {
                  e.preventDefault();
                  handleClose();
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className="text-black w-full bg-red-400 hover:bg-red-400/80"
                onClick={(e) => {
                  e.preventDefault();
                  handleRollback();
                }}
                type="button"
                disabled={isPendingRollback || isPendingUpdate || !productId}
              >
                {isPendingRollback ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Rollback
              </Button>
              <Button
                className={cn(
                  "text-black w-full",
                  productId
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80",
                )}
                type="submit"
                disabled={isPendingUpdate || isPendingRollback}
                // disabled={parseFloat(input.actual_quantity_product) <= 0}
              >
                {isPendingUpdate ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openDetail}
        onOpenChange={() => {
          handleCloseDetail();
        }}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Detail Product</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex gap-2 items-center">
              <Input
                className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                placeholder="Search history..."
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  setHistoryPage(1);
                }}
              />

              <Button
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant="outline"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["detail-manifest-inbound-sku-history"],
                  })
                }
              >
                <RefreshCw
                  className={cn(
                    "w-4 h-4",
                    isRefetchingProductHistory ? "animate-spin" : "",
                  )}
                />
              </Button>
            </div>

            <DataTable
              isSticky
              maxHeight="h-[55vh]"
              isLoading={isLoadingProductHistory || isRefetchingProductHistory}
              columns={columnDetailHistory}
              data={dataDetailProductHistory}
            />

            <Pagination
              pagination={{
                ...historyMetaPage,
                current: historyPage,
              }}
              setPagination={setHistoryPage}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
