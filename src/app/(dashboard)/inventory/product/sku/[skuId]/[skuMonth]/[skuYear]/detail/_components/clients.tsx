"use client";
import Loading from "@/app/(dashboard)/loading";
import Forbidden from "@/components/403";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { AxiosError } from "axios";
import {
  ArrowLeftRight,
  Boxes,
  Loader2,
  ReceiptText,
  RefreshCw,
  Shield,
  Trash2,
} from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useGetDetailProductSku } from "../_api/use-get-detail-product-sku";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCreateEditBarcodeSKU } from "../_api/use-create-edit-barcode-mi";
import { useDeleteBarcodeSku } from "../_api/use-delete-barcode-mi";
import { useConfirm } from "@/hooks/use-confirm";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useToDamaged } from "../_api/use-to-damaged";
import DialogHistoryBundling from "./dialog-history-bundling";
import { useGetListHistoryBundling } from "../_api/use-get-list-history-bundling";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const Client = () => {
  const { skuId, skuMonth, skuYear } = useParams();
  const queryClient = useQueryClient();
  const [isHistoryBundling, setIsHistoryBundling] = useState(false);
  const [input, setInput] = useState("");
  const [openDamaged, setOpenDamaged] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [totalDamaged, setTotalDamaged] = useState("");
  const [notesDamaged, setNotesDamaged] = useState("");

  const codeDocument = `${skuId}/${skuMonth}/${skuYear}`;
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });
  const [historyBundlingSearch, setHistoryBundlingSearch] = useState("");
  const searchHistoryBundlingValue = useDebounce(historyBundlingSearch);
  const [pageHistoryBundling, setPageHistoryBundling] = useState(1);
  const [metaPageHistoryBundling, setMetaPageHistoryBundling] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });
  const [cEBarcode, setCEBarcode] = useQueryState(
    "create-edit-barcode",
    parseAsBoolean.withDefault(false),
  );

  const { mutate: mutateCE } = useCreateEditBarcodeSKU();
  const { mutate: mutateDeleteBarcode } = useDeleteBarcodeSku();
  const { mutate: mutateDamaged, isPending: isDamagedLoading } = useToDamaged();

  const [DeleteBarcodeDialog, confirmBarcodeDelete] = useConfirm(
    "Delete Barcode",
    "This action cannot be undone",
    "destructive",
  );

  const {
    data,
    error,
    refetch,
    isError,
    isPending,
    isRefetching,
    isLoading,
    isSuccess,
  } = useGetDetailProductSku({
    code: codeDocument,
    p: page,
    q: searchValue,
  });

  const {
    data: dataHistoryBundling,
    refetch: refetchHistoryBundling,
    isRefetching: isRefetchingHistoryBundling,
    isLoading: isLoadingHistoryBundling,
    error: errorHistoryBundling,
    isError: isErrorHistoryBundling,
    isSuccess: isSuccessHistoryBundling,
  } = useGetListHistoryBundling({
    code_documents: codeDocument,
    p: pageHistoryBundling,
    q: searchHistoryBundlingValue,
  });

  const dataDetails = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);
  const dataDocumentsInfo = dataDetails?.document_info;
  const dataDetailProductSku = dataDetails?.products?.data;

  const dataListHistoryBundling: any[] = useMemo(() => {
    return dataHistoryBundling?.data.data.resource.data;
  }, [dataHistoryBundling]);

  const handleDeleteBarcode = async () => {
    const ok = await confirmBarcodeDelete();

    if (!ok) return;

    mutateDeleteBarcode(
      { code_document: codeDocument },
      {
        onSuccess: () => {
          setCEBarcode(false);
          setInput("");
          queryClient.invalidateQueries({
            queryKey: ["detail-product-sku", codeDocument],
          });
        },
      },
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutateCE(
      {
        code_document: codeDocument,
        init_barcode: input,
      },
      {
        onSuccess: () => {
          setCEBarcode(false);
          setInput("");
          queryClient.invalidateQueries({
            queryKey: ["detail-product-sku", codeDocument],
          });
        },
      },
    );
  };

  const handleSubmitDamaged = (e: FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) return;

    const body = {
      damaged_quantity: Number(totalDamaged),
      description: notesDamaged,
    };
    mutateDamaged(
      {
        body,
        id: selectedProduct,
      },
      {
        onSuccess: () => {
          setOpenDamaged(false);
          setSelectedProduct(null);
          setTotalDamaged("");
          setNotesDamaged("");
          queryClient.invalidateQueries({
            queryKey: ["detail-product-sku", codeDocument],
          });
        },
      },
    );
  };

  const handleCloseHistoryBundling = () => {
    setIsHistoryBundling(false);
    setHistoryBundlingSearch("");
    setPageHistoryBundling(1);
    setMetaPageHistoryBundling({
      from: 0,
      last: 0,
      perPage: 0,
      total: 0,
    });
  };

  useEffect(() => {
    setPaginate({
      isSuccess,
      data,
      dataPaginate: dataDetails?.products,
      setPage,
      setMetaPage,
    });
  }, [data]);

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccessHistoryBundling,
      data: dataHistoryBundling,
      dataPaginate: dataHistoryBundling?.data.data.resource,
      setPage: setPageHistoryBundling,
      setMetaPage: setMetaPageHistoryBundling,
    });
  }, [dataHistoryBundling]);

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
      isError: isErrorHistoryBundling,
      error: errorHistoryBundling as AxiosError,
      data: "HistoryBundling",
      action: "get data",
      method: "GET",
    });
  }, [isErrorHistoryBundling, errorHistoryBundling]);

  useEffect(() => {
    if (isSuccess && data && cEBarcode) {
      setInput(dataDocumentsInfo?.custom_barcode ?? "");
    }
  }, [cEBarcode]);

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
      accessorKey: "barcode_product",
      header: "Barcode",
    },
    {
      accessorKey: "name_product",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.name_product}
        </div>
      ),
    },
    {
      accessorKey: "price_product",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.price_product)}
        </div>
      ),
    },
    {
      accessorKey: "quantity_product",
      header: "Qty",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.quantity_product}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Bundling</p>}>
            <Button
              asChild
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              // disabled={isLoadingProduct || isPendingUpdate || isPendingCreate}
              // onClick={() => {
              //   queryClient.invalidateQueries({
              //     queryKey: [
              //       "detail-bundling-product-sku",
              //       row.original.code_document,
              //     ],
              //   });
              // }}
            >
              <Link
                href={`/inventory/product/sku/${row.original.code_document}/detail/${row.original.id}/bundling`}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Boxes className="size-4" />
                )}
              </Link>
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Damaged</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              // disabled={isLoadingProduct || isPendingUpdate || isPendingCreate}
              onClick={() => {
                setSelectedProduct(row.original.id);
                setOpenDamaged(true);
              }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  const columnHistoryBundling: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPageHistoryBundling.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "tanggal",
      header: "Date",
      cell: ({ row }) => {
        const formatted = format(
          new Date(row.original.tanggal),
          "iiii, dd MMMM yyyy",
        );
        return <div className="tabular-nums">{formatted}</div>;
      },
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => row.original.user,
    },
    {
      accessorKey: "produk",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">{row.original.produk}</div>
      ),
    },
    {
      accessorKey: "type_badge",
      header: "Type",
      cell: ({ row }) => (
        // <div className="max-w-[500px] break-all">{row.original.type_badge}</div>
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded w-20 px-0 justify-center font-normal capitalize",
              row.original.type_badge === "bundling"
                ? "bg-green-400 text-black hover:bg-green-400"
                : "bg-yellow-400 text-black hover:bg-yellow-400",
            )}
          >
            {row.original.type_badge}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "price_before",
      header: "Price Before",
      cell: ({ row }) =>
        formatRupiah(Number(row.original.price_before.replace(/,/g, ""))),
    },
    {
      accessorKey: "price_after",
      header: "Price After",
      cell: ({ row }) =>
        formatRupiah(Number(row.original.price_after.replace(/,/g, ""))),
    },

    {
      accessorKey: "qty_before",
      header: "Qty Before",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">{row.original.qty_before}</div>
      ),
    },
    {
      accessorKey: "qty_after",
      header: "Qty After",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">{row.original.qty_after}</div>
      ),
    },
    {
      accessorKey: "items_per_bundle",
      header: "Items /bundle",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.items_per_bundle}
        </div>
      ),
    },
    {
      accessorKey: "bundling",
      header: "Bundling",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">{row.original.bundling}</div>
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
      <DeleteBarcodeDialog />
      <DialogHistoryBundling
        open={isHistoryBundling}
        onCloseModal={() => {
          if (isHistoryBundling) {
            handleCloseHistoryBundling();
          }
        }}
        search={historyBundlingSearch}
        setSearch={setHistoryBundlingSearch}
        refetch={refetchHistoryBundling}
        isRefetching={isRefetchingHistoryBundling}
        isLoading={isLoadingHistoryBundling}
        columns={columnHistoryBundling}
        dataTable={dataListHistoryBundling}
        page={pageHistoryBundling}
        metaPage={metaPageHistoryBundling}
        setPage={setPageHistoryBundling}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inventory</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <button
              type="button"
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["list-document-sku"],
                })
              }
            >
              <BreadcrumbLink href="/inventory/product/sku">
                Sku{" "}
              </BreadcrumbLink>
            </button>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Detail</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full bg-white rounded-md shadow border p-4">
        <div className="flex justify-between items-start gap-6">
          {/* LEFT INFO */}
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-sm text-gray-500">Nama Dokumen</p>
              <p className="font-semibold">
                {dataDocumentsInfo?.code_document}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Nama Excel</p>
              <p className="font-semibold">
                {dataDocumentsInfo?.base_document}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Total List Product</p>
              <p className="font-semibold">{dataDocumentsInfo?.total_items}</p>
            </div>
          </div>

          {/* RIGHT BARCODE */}
          <Dialog open={cEBarcode} onOpenChange={setCEBarcode}>
            <DialogTrigger asChild>
              <button className="text-sm gap-3 font-medium flex items-center hover:bg-sky-100 rounded pr-2 pl-3  text-sky-700 focus-visible:outline-none focus-visible:ring-0 group border border-sky-400">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Custom Barcode</p>
                  <p className="font-semibold">
                    {dataDocumentsInfo?.custom_barcode ?? "-"}
                  </p>
                </div>
                <div className="flex items-center justify-center size-6 bg-sky-100 group-hover:bg-sky-200 hover:bg-sky-200 rounded-full border border-sky-700">
                  <ArrowLeftRight className="w-3 h-3" />
                </div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {dataDetailProductSku?.custom_barcode ? "Edit" : "Create"}{" "}
                  Barcode
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit}
                className="w-full flex flex-col gap-4"
              >
                <div className="w-full flex flex-col gap-3">
                  <div className="w-full flex flex-col border rounded border-gray-500 p-3 gap-2">
                    <div className="flex items-center text-sm font-semibold border-b border-gray-500 pb-2">
                      {/* <FileSpreadsheet className="w-4 h-4 mr-2" /> */}
                      Base Document
                    </div>
                    <h5 className="pl-6 text-sm">
                      {dataDocumentsInfo?.code_document}
                    </h5>
                  </div>
                  <div className="flex w-full flex-col gap-1">
                    <Label htmlFor="customBarcode">Custom Barcode</Label>
                    <div className="flex w-full gap-2">
                      <Input
                        id="customBarcode"
                        className="w-full border-sky-400/80 focus-visible:ring-sky-400"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Custom Barcode..."
                      />
                      {dataDocumentsInfo?.custom_barcode && (
                        <Button
                          size={"icon"}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteBarcode();
                          }}
                          className="bg-red-50 hover:bg-red-100 border border-red-500 text-red-500 flex-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex w-full gap-2">
                  <Button
                    className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                    onClick={() => {
                      setCEBarcode(false);
                      setInput("");
                    }}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-sky-400 hover:bg-sky-400/80 text-black w-full"
                    type="submit"
                  >
                    Update
                  </Button>
                </div>
              </form>
            </DialogContent>{" "}
          </Dialog>
        </div>
      </div>

      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">List of Document Data</h2>

          <div className="flex gap-4 items-center">
            <Button
              onClick={(e) => {
                e.preventDefault();
                setIsHistoryBundling(true);
              }}
              className="items-center flex h-9 bg-sky-400/80 hover:bg-sky-400 text-black
        disabled:opacity-100 disabled:hover:bg-sky-400
        disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant="outline"
            >
              <ReceiptText className="w-4 h-4 mr-1" />
              History
            </Button>
          </div>
        </div>
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
            data={dataDetailProductSku ?? []}
          />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
      <Dialog open={openDamaged} onOpenChange={setOpenDamaged}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Damaged Product</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitDamaged} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label>Total Damaged</Label>
              <Input
                type="number"
                min={1}
                value={totalDamaged}
                onChange={(e) => setTotalDamaged(e.target.value)}
                placeholder="Input total damaged..."
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Notes</Label>
              <Textarea
                value={notesDamaged}
                onChange={(e) => setNotesDamaged(e.target.value)}
                placeholder="Notes damaged..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setOpenDamaged(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                disabled={isDamagedLoading}
              >
                {isDamagedLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Damaged"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
