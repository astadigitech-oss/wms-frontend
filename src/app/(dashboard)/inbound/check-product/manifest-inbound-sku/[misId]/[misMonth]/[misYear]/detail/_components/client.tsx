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
import { Edit3, Loader2, RefreshCw, ScanBarcode, Send } from "lucide-react";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { Button } from "@/components/ui/button";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import Loading from "@/app/(dashboard)/loading";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUpdateProduct } from "../_api/use-update-product";
import { useGetDetailProduct } from "../_api/use-get-detail-product";
import Pagination from "@/components/pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { useSubmitDocumentSku } from "../_api/use-submit-doc-sku";

export const Client = () => {
  const { misId, misMonth, misYear } = useParams();
  const queryClient = useQueryClient();
  const [openEdit, setOpenEdit] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false),
  );
  const [productId, setProductId] = useQueryState("productId", {
    defaultValue: "",
  });
  const [input, setInput] = useState({
    old_name_product: "",
    actual_quantity_product: "0",
    damaged_quantity_product: "0",
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

  const [SubmitSkuDialog, confirmSubmitSkuDialog] = useConfirm(
    "Submit Product SKU",
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

  const { mutate: mutateUpdate, isPending: isPendingUpdate } =
    useUpdateProduct();
  const { mutate: mutateSubmitSku, isPending: isPendingSubmitSku } =
    useSubmitDocumentSku();
  const dataDetails = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);
  const dataDetailMI = dataDetails?.data.data;
  const statusMIS = dataDetails?.status;
  
  const handleClose = () => {
    setOpenEdit(false);
    setProductId("");
    setInput({
      old_name_product: "",
      actual_quantity_product: "0",
      damaged_quantity_product: "0",
      // lost_quantity_product: "0",
    });
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      actual_quantity_product: input.actual_quantity_product,
      damaged_quantity_product: input.damaged_quantity_product,
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

  const handleSubmitSku = async () => {
    const ok = await confirmSubmitSkuDialog();

    if (!ok) return;

    mutateSubmitSku({
      code_document: codeDocument,
    });
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
          <TooltipProviderPage value={<p>Edit</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-100 disabled:hover:bg-yellow-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isLoadingProduct || isPendingUpdate || statusMIS === "done"}
              onClick={(e) => {
                e.preventDefault();
                setProductId(row.original.id);
                setOpenEdit(true);
              }}
            >
              {isLoading || isPendingUpdate ? (
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
      <SubmitSkuDialog />
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
            <TooltipProviderPage value={"Add Product"} align="end">
              <Button
                disabled={isPendingSubmitSku || statusMIS === "done"}
                onClick={handleSubmitSku}
                className="items-center w-9 px-0 flex-none h-9 bg-sky-400/80 text-black hover:bg-sky-400"
              >
                <Send className="size-4" />
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
                className={cn(
                  "text-black w-full",
                  productId
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80",
                )}
                type="submit"
                // disabled={parseFloat(input.actual_quantity_product) <= 0}
              >
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
