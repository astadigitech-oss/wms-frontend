"use client";

import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Combine,
  Loader2,
  Minus,
  Palette,
  Plus,
  ReceiptText,
  RefreshCw,
  ScanBarcode,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useQueryClient } from "@tanstack/react-query";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useGetProductApprove } from "../_api/use-get-product-approve";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { useGetDetailProductApprove } from "../_api/use-get-detail-product-approve";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { usePartialStaging } from "../_api/use-partial-staging";
import { useDelDocPA } from "../_api/use-del-doc-pa";
import { useDelProductDetPA } from "../_api/use-del-product-det-pa copy";
import { useConfirm } from "@/hooks/use-confirm";
import { Label } from "@/components/ui/label";
import BarcodePrinted from "@/components/barcode";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "motion/react";
import { useGetProductDetailPA } from "../_api/use-get-product-detail-pa";
import { useUpdateProductPA } from "../_api/use-update-product-pa";
import { useGetPriceProductPA } from "../_api/use-get-price-product-pa";

const categoryVariant = {
  isClose: { width: "0px", padding: "0px", marginLeft: "0px" },
  isOpen: { width: "300px", padding: "20px", marginLeft: "8px" },
};

interface QualityData {
  lolos: string | null;
  damaged: string | null;
  abnormal: string | null;
}

export const Client = () => {
  const queryClient = useQueryClient();

  const [codeDocument, setCodeDocument] = useQueryState("code", {
    defaultValue: "",
  });
  const [isOpenDetail, setIsOpenDetail] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false),
  );
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorData, setErrorData] = useState<string[]>([]);

  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const [dataSearchDetail, setDataSearchDetail] = useQueryState("q2", {
    defaultValue: "",
  });
  const searchValueDetail = useDebounce(dataSearchDetail);
  const [pageDetail, setPageDetail] = useQueryState(
    "p2",
    parseAsInteger.withDefault(1),
  );
  const [metaPageDetail, setMetaPageDetail] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const [PartialStagingDialog, confirmPartialStaging] = useConfirm(
    "To Partial Staging Document Product Approve",
    "This action cannot be undone",
    "liquid",
  );
  const [DeleteDocumentDialog, confirmDeleteDocument] = useConfirm(
    "Delete Document Product Approve",
    "This action cannot be undone",
    "destructive",
  );
  const [DeleteProductDialog, confirmDeleteProduct] = useConfirm(
    "Delete Product Approve",
    "The product will be moved to the scan list",
    "destructive",
  );

  const { mutate: mutatePartialStaging, isPending: isPendingStaging } =
    usePartialStaging();
  const { mutate: mutateDelDocPA, isPending: isPendingDelDoc } = useDelDocPA();
  const { mutate: mutateDelProductDetPA, isPending: isPendingDelProd } =
    useDelProductDetPA();

  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetProductApprove({ p: page, q: searchValue });

  const {
    data: dataDetail,
    refetch: refetchDetail,
    isSuccess: isSuccessDetail,
    error: errorDetail,
    isError: isErrorDetail,
  } = useGetDetailProductApprove({
    code: codeDocument,
    p: pageDetail,
    q: searchValueDetail,
  });

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const dataListDetail: any[] = useMemo(() => {
    return dataDetail?.data.data.resource.data;
  }, [dataDetail]);

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
    setPaginate({
      isSuccess: isSuccessDetail,
      data: dataDetail,
      dataPaginate: dataDetail?.data.data.resource,
      setPage: setPageDetail,
      setMetaPage: setMetaPageDetail,
    });
  }, [dataDetail]);

  useEffect(() => {
    alertError({
      isError: isErrorDetail,
      error: errorDetail as AxiosError,
      action: "get data",
      data: "Detail",
      method: "GET",
    });
  }, [isErrorDetail, errorDetail]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  const handlePartialStaging = async (code: string) => {
    const ok = await confirmPartialStaging();

    if (!ok) return;

    mutatePartialStaging(
      { code_document: code },
      {
        onSuccess: (res: any) => {
          console.log("RES_PARTIAL_STAGING:", res);
          const response = res?.data?.data;

          if (!response?.status) {
            setErrorMessage(response.message ?? "Terjadi kesalahan");
            setErrorData(response.resource ?? []);

            // tunggu confirm dialog tertutup dulu
            setTimeout(() => {
              setIsErrorDialogOpen(true);
            }, 200);

            return;
          }
        },

        onError: (err: any) => {
          const response = err?.response?.data?.data;

          setErrorMessage(response?.message ?? "Terjadi kesalahan");

          setErrorData(response?.resource ?? []);

          setTimeout(() => {
            setIsErrorDialogOpen(true);
          }, 200);
        },
      },
    );
  };
  const handleDeleteDocument = async (code: string) => {
    const ok = await confirmDeleteDocument();

    if (!ok) return;

    mutateDelDocPA({ code_document: code });
  };
  const handleDeleteProduct = async (id: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    mutateDelProductDetPA(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["detail-product-approve", codeDocument],
          });
        },
      },
    );
  };

  // ---------------- Start Detail Fn -------------------- //

  const [isOpenCategory, setIsOpenCategory] = useQueryState(
    "categories",
    parseAsBoolean.withDefault(false),
  );
  const [isOpenDetailProduct, setIsOpenDetailProduct] = useQueryState(
    "dialog2",
    parseAsBoolean.withDefault(false),
  );
  const [productId, setProductId] = useQueryState("productId", {
    defaultValue: "",
  });
  const [input, setInput] = useState({
    name: "",
    price: "0",
    qty: "1",
    category: "",
  });

  const { mutate: updateProduct, isSuccess: isSuccessUpdate } =
    useUpdateProductPA();

  const { data: dataProduct, isSuccess: isSuccessProduct } =
    useGetProductDetailPA({ id: productId });

  const dataDetailProduct: any = useMemo(() => {
    return dataProduct?.data.data.resource;
  }, [dataProduct]);

  const { data: dataPrice } = useGetPriceProductPA({
    price: dataDetailProduct?.old_price_product,
  });

  useEffect(() => {
    if (isSuccessProduct && dataProduct) {
      setInput({
        name: dataProduct?.data.data.resource.new_name_product ?? "",
        price: dataProduct?.data.data.resource.new_price_product ?? "0",
        qty: dataProduct?.data.data.resource.new_quantity_product ?? "1",
        category: dataProduct?.data.data.resource.new_category_product ?? "",
      });
    }
    if (dataProduct?.data.data.resource.new_category_product) {
      setIsOpenCategory(true);
    } else {
      setIsOpenCategory(false);
    }
  }, [dataProduct]);

  const categories: any[] = useMemo(() => {
    return dataPrice?.data.data.resource.category ?? [];
  }, [dataPrice]);

  const findNotNull = (v: any) => {
    if (v) {
      const qualityObject = JSON.parse(v);

      const filteredEntries = Object.entries(qualityObject).find(
        ([, value]) => value !== null,
      );

      return filteredEntries?.[0] ?? "";
    }
  };

  const handleUpdate = () => {
    const body = {
      code_document: dataDetailProduct?.code_document,
      old_barcode_product: dataDetailProduct?.old_barcode_product,
      new_barcode_product: dataDetailProduct?.new_barcode_product,
      new_name_product: input.name,
      old_name_product: dataDetailProduct?.new_name_product,
      new_quantity_product: input.qty,
      new_price_product: input.price,
      old_price_product: dataDetailProduct?.old_price_product,
      new_date_in_product: dataDetailProduct?.new_date_in_product,
      new_status_product: dataDetailProduct?.new_status_product,
      condition: Object.keys(JSON.parse(dataDetailProduct?.new_quality)).find(
        (key) =>
          JSON.parse(dataDetailProduct?.new_quality)[
            key as keyof QualityData
          ] !== null,
      ),
      new_category_product:
        input.category ?? dataDetailProduct?.new_category_product,
      new_tag_product: dataDetailProduct?.new_tag_product,
    };
    updateProduct(
      { id: dataDetailProduct.id, body },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["product-detail-product-approve", dataDetailProduct.id],
          });
        },
      },
    );
  };

  const handleClose = () => {
    setIsOpenDetailProduct(false);
    setProductId("");
    if (isSuccessUpdate) {
      queryClient.invalidateQueries({
        queryKey: ["detail-product-approve", codeDocument],
      });
    }
  };

  useEffect(() => {
    if (isNaN(parseFloat(input.qty))) {
      setInput((prev) => ({ ...prev, qty: "0" }));
    }
  }, [input]);

  // ---------------- End Detail Fn ---------------------//

  const columnPeoductApprove: ColumnDef<any>[] = [
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
      accessorKey: "code_document",
      header: "Document Code",
      cell: ({ row }) => (
        <div className="tabular-nums">{row.original.code_document}</div>
      ),
    },
    {
      accessorKey: "base_document",
      header: "Base Document",
      cell: ({ row }) => (
        <div className="capitalize max-w-[500px] break-all">
          {row.original.base_document}
        </div>
      ),
    },
    {
      accessorKey: "total_column_in_document",
      header: () => <div className="text-center">Total</div>,
      cell: ({ row }) => (
        <div className="tabular-nums text-center">
          {Math.round(row.original.total_column_in_document).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "status_document",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded w-20 px-0 justify-center text-black font-normal capitalize",
              row.original.status_document === "pending" &&
                "bg-gray-200 hover:bg-gray-200",
              row.original.status_document === "in progress" &&
                "bg-yellow-400 hover:bg-yellow-400",
              row.original.status_document === "done" &&
                "bg-green-400 hover:bg-green-400",
            )}
          >
            {row.original.status_document}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>To Partial Stagging</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-green-400 text-green-700 hover:text-green-700 hover:bg-green-50 disabled:opacity-100 disabled:hover:bg-green-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isPendingStaging}
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                handlePartialStaging(row.original.code_document);
              }}
            >
              {isPendingStaging ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Combine className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Detail</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                setIsOpenDetail(true);
                setCodeDocument(row.original.code_document);
              }}
            >
              <ReceiptText className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Delete</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isPendingDelDoc}
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteDocument(row.original.code_document);
              }}
            >
              {isPendingDelDoc ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];
  const columnDetailPeoductApprove: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPageDetail.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "old_barcode_product",
      header: "Old Barcode",
    },
    {
      accessorKey: "new_barcode_product",
      header: "New Barcode",
    },
    {
      accessorKey: "new_name_product",
      header: () => <div className="text-center">Product Name</div>,
      cell: ({ row }) => (
        <div className="max-w-[300px] break-all">
          {row.original.new_name_product}
        </div>
      ),
    },
    {
      accessorKey: "new_status_product",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge className="rounded w-20 px-0 justify-center text-black font-normal capitalize bg-green-400 hover:bg-green-400">
            {row.original.new_status_product}
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
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                setProductId(row.original.id);
                setIsOpenDetailProduct(true);
              }}
            >
              <ReceiptText className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={"Delete"}>
            <Button
              className="items-center border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 p-0 w-9 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isPendingDelProd}
              variant={"outline"}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteProduct(row.original.id);
              }}
            >
              {isPendingDelProd ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (!isOpenDetail) {
      setCodeDocument("");
    }
  }, [isOpenDetail]);

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
      <DeleteDocumentDialog />
      <DeleteProductDialog />
      <PartialStagingDialog />
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Error
            </DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>

          {errorData.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold mb-2">
                Barcode yang perlu di-approve:
              </p>

              <ul className="list-disc list-inside max-h-60 overflow-auto text-sm space-y-1">
                {errorData.map((barcode, index) => (
                  <li key={index}>{barcode}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button
              onClick={() => setIsErrorDialogOpen(false)}
              className="bg-sky-400/80 hover:bg-sky-400 text-black"
            >
              Close
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
          <BreadcrumbItem>Inbound</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Check Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Product Approve</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Approved Document</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full">
            <div className="w-2/5 flex items-center relative">
              <Input
                className="w-full border-sky-400/80 focus-visible:ring-sky-400"
                value={dataSearch}
                onChange={(e) => setDataSearch(e.target.value)}
                placeholder="Search..."
              />
              {dataSearch && (
                <button
                  type="button"
                  onClick={() => setDataSearch("")}
                  className="absolute right-3"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
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
          <DataTable columns={columnPeoductApprove} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
      <Sheet open={isOpenDetail} onOpenChange={setIsOpenDetail}>
        <SheetContent className="min-w-[70vw] space-y-4">
          <SheetHeader>
            <SheetTitle>Detail Product Approve</SheetTitle>
          </SheetHeader>
          <div className="flex items-center gap-3 w-full">
            <div className="w-2/5 relative flex items-center">
              <Input
                className="w-full border-sky-400/80 focus-visible:ring-sky-400"
                value={dataSearchDetail}
                onChange={(e) => setDataSearchDetail(e.target.value)}
                placeholder="Search..."
              />
              {dataSearchDetail && (
                <button
                  type="button"
                  onClick={() => setDataSearchDetail("")}
                  className="absolute right-3"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <TooltipProviderPage value={"Reload Data"}>
              <Button
                onClick={() => refetchDetail()}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant={"outline"}
              >
                <RefreshCw
                  className={cn("w-4 h-4", loading ? "animate-spin" : "")}
                />
              </Button>
            </TooltipProviderPage>
          </div>
          <DataTable
            isSticky
            columns={columnDetailPeoductApprove}
            data={dataListDetail ?? []}
          />
          <Pagination
            pagination={{ ...metaPageDetail, current: pageDetail }}
            setPagination={setPageDetail}
          />
        </SheetContent>
      </Sheet>
      <Dialog open={isOpenDetailProduct} onOpenChange={handleClose}>
        <DialogContent
          className={cn(
            "bg-transparent border-none shadow-none rounded-none p-0 flex gap-0",
            dataDetailProduct?.new_tag_product ||
              findNotNull(dataDetailProduct?.new_quality) !== "damaged" ||
              findNotNull(dataDetailProduct?.new_quality) !== "abnormal"
              ? "max-w-5xl"
              : "max-w-6xl",
          )}
        >
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <div className="w-full flex gap-4 bg-white rounded-md p-5 flex-col">
            <h3 className="font-bold text-xl">Detail & Edit Product</h3>
            <div className="w-full relative overflow-hidden flex flex-col gap-4">
              <div className="w-full flex flex-col gap-3">
                <div className="w-full flex flex-col border rounded border-gray-500 p-3 gap-2">
                  <div className="flex items-center text-sm font-semibold border-b border-gray-500 pb-2">
                    <ScanBarcode className="w-4 h-4 mr-2" />
                    <div className="flex w-full items-center justify-between">
                      <p>Old Data</p>
                      <Badge className="bg-gray-200 hover:bg-gray-200 border border-black rounded-full text-black">
                        {dataDetailProduct?.old_barcode_product}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col pl-6 w-full overflow-hidden gap-1">
                      <p className="text-xs font-medium">Name Product</p>
                      <p className="text-sm text-gray-500 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        {dataDetailProduct?.new_name_product}
                      </p>
                    </div>
                    <div className="w-1/3 flex-none pl-6 flex gap-2 ">
                      <div className="flex flex-col w-2/3 overflow-hidden gap-1">
                        <p className="text-xs font-medium">Price</p>
                        <p className="text-sm text-gray-500 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {formatRupiah(
                            parseFloat(
                              dataDetailProduct?.old_price_product ?? "0",
                            ),
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col w-1/3 overflow-hidden gap-1">
                        <p className="text-xs font-medium">Qty</p>
                        <p className="text-sm text-gray-500 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {parseFloat(
                            dataDetailProduct?.new_quantity_product ?? "0",
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex w-full gap-3 items-center bg-gray-300 rounded-md px-5 py-2">
                  <AlertCircle className="text-black h-4 w-4" />
                  <p className="text-sm font-medium">
                    To change the new price on the barcode, please update the
                    product first.
                  </p>
                </div>
                <div className="w-full flex gap-3">
                  <div className="w-full flex flex-col border rounded border-gray-500 p-3 gap-2">
                    <div className="flex items-center text-sm font-semibold border-b border-gray-500 pb-2">
                      <ScanBarcode className="w-4 h-4 mr-2" />
                      <div className="flex w-full items-center justify-between">
                        <p>New Data</p>
                        <div className="flex gap-4">
                          <Badge
                            className={cn(
                              "border rounded-full",
                              findNotNull(dataDetailProduct?.new_quality) ===
                                "lolos" &&
                                "bg-green-200 hover:bg-green-200 border-green-700 text-green-700",
                              findNotNull(dataDetailProduct?.new_quality) ===
                                "damaged" &&
                                "bg-red-200 hover:bg-red-200 border-red-700 text-red-700",
                              findNotNull(dataDetailProduct?.new_quality) ===
                                "abnormal" &&
                                "bg-orange-200 hover:bg-orange-200 border-orange-700 text-orange-700",
                            )}
                          >
                            {findNotNull(dataDetailProduct?.new_quality)}
                          </Badge>
                          <Badge className="bg-gray-200 hover:bg-gray-200 border border-black rounded-full text-black">
                            {dataDetailProduct?.new_barcode_product}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdate();
                      }}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex flex-col pl-6 w-full  gap-1">
                        <Label
                          htmlFor="nameNew"
                          className="text-xs font-medium"
                        >
                          Name Product
                        </Label>
                        <Input
                          id="nameNew"
                          className="w-full border-sky-400/80 focus-visible:ring-sky-400"
                          value={input.name}
                          onChange={(e) =>
                            setInput((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Custom Barcode..."
                        />
                      </div>
                      <div className="w-full flex-none pl-6 flex gap-2 ">
                        <div className="flex flex-col w-full  gap-1">
                          <Label
                            htmlFor="priceNew"
                            className="text-xs font-medium"
                          >
                            Price
                          </Label>
                          <Input
                            id="priceNew"
                            className="w-full border-sky-400/80 focus-visible:ring-sky-400"
                            value={Math.round(parseFloat(input.price))}
                            onChange={(e) =>
                              setInput((prev) => ({
                                ...prev,
                                price: e.target.value,
                              }))
                            }
                            placeholder="Custom Barcode..."
                          />
                        </div>
                        <div className="flex flex-col w-full gap-1">
                          <Label>Qty</Label>
                          <div className="relative flex items-center">
                            <Input
                              value={input.qty}
                              onChange={(e) =>
                                setInput((prev) => ({
                                  ...prev,
                                  qty:
                                    e.target.value.length > 1 &&
                                    e.target.value.startsWith("0")
                                      ? e.target.value.replace(/^0+/, "")
                                      : e.target.value,
                                }))
                              }
                              className="w-full border-sky-400/80 focus-visible:ring-sky-400 disabled:opacity-100 disabled:cursor-default"
                            />
                            <div className="flex absolute right-2 gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setInput((prev) => ({
                                    ...prev,
                                    qty: (parseFloat(prev.qty) - 1).toString(),
                                  }))
                                }
                                disabled={parseFloat(input.qty) === 0}
                                className="w-6 h-6 flex items-center justify-center rounded bg-sky-100 hover:bg-sky-200 disabled:hover:bg-sky-100 disabled:opacity-50"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setInput((prev) => ({
                                    ...prev,
                                    qty: (parseFloat(prev.qty) + 1).toString(),
                                  }))
                                }
                                className="w-6 h-6 flex items-center justify-center rounded bg-sky-100 hover:bg-sky-200"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!dataDetailProduct?.new_tag_product &&
                        (findNotNull(dataDetailProduct?.new_quality) !==
                          "damaged" ||
                          findNotNull(dataDetailProduct?.new_quality) !==
                            "abnormal") && (
                          <div className="flex flex-col gap-1 pl-6">
                            <Label className="text-xs font-medium">
                              Category
                            </Label>
                            <Button
                              type="button"
                              onClick={() => setIsOpenCategory(!isOpenCategory)}
                              className="justify-between border-sky-400/80 focus:ring-sky-400 focus:ring-1 hover:bg-sky-50 focus:bg-sky-50"
                              variant={"outline"}
                            >
                              <p>
                                {input.category ??
                                  dataDetailProduct?.new_category_product ?? (
                                    <span className="italic underline">
                                      No Category yet.
                                    </span>
                                  )}
                              </p>
                              <p className="text-xs italic font-light underline text-gray-600">
                                change &gt;&gt;
                              </p>
                            </Button>
                          </div>
                        )}
                      <Button
                        disabled={
                          !input.name ||
                          parseFloat(input.qty) === 0 ||
                          (dataDetailProduct?.old_price_product >= 100000 &&
                            !input.category &&
                            findNotNull(dataDetailProduct?.new_quality) ===
                              "lolos")
                        }
                        className="ml-6 mt-2 bg-sky-400/80 hover:bg-sky-400 text-black"
                        type="submit"
                      >
                        Update
                      </Button>
                    </form>
                  </div>
                  <div className="w-fit flex flex-none">
                    {dataDetailProduct?.new_category_product ? (
                      <BarcodePrinted
                        barcode={dataDetailProduct?.new_barcode_product}
                        description={dataDetailProduct?.new_name_product}
                        newPrice={dataDetailProduct?.new_price_product}
                        oldPrice={dataDetailProduct?.old_price_product}
                        category={dataDetailProduct?.new_category_product}
                      />
                    ) : (
                      <div className="w-auto">
                        <div className="w-[282px] p-3 flex flex-col gap-3 border border-gray-500 rounded text-sm">
                          <div className="flex items-center text-sm font-semibold border-b border-gray-500 pb-2">
                            <Palette className="w-4 h-4 mr-2" />
                            <p>Color</p>
                          </div>
                          <p className="pl-6">
                            {dataDetailProduct?.new_tag_product}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="">
                <Button
                  className=" bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                  onClick={handleClose}
                  type="button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
          <motion.div
            initial="isClose"
            animate={isOpenCategory ? "isOpen" : "isClose"}
            variants={categoryVariant}
            className=" bg-white rounded-md flex flex-col gap-4 flex-none"
          >
            <h3
              className={cn(
                "font-bold text-xl",
                isOpenCategory ? "flex" : "hidden",
              )}
            >
              Select Category
            </h3>
            <ScrollArea
              className={cn(
                "h-[500px] w-full border border-sky-500 p-2 rounded-md",
                isOpenCategory ? "flex" : "hidden",
              )}
            >
              <RadioGroup
                onValueChange={(e) => {
                  const selectedCategory = categories.find(
                    (item) => item.name_category === e,
                  );
                  setInput((prev) => ({
                    ...prev,
                    category: selectedCategory?.name_category ?? "",
                    price: (
                      dataDetailProduct?.old_price_product -
                      (dataDetailProduct?.old_price_product / 100) *
                        parseFloat(selectedCategory?.discount_category ?? "0")
                    ).toString(),
                  }));
                }}
                className="flex flex-col w-[calc(100%-8px)] gap-4"
              >
                {categories?.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-4 w-full border px-4 py-2.5 rounded-md",
                      input.category === item.name_category
                        ? "border-gray-500 bg-sky-100"
                        : "border-gray-300",
                    )}
                  >
                    <RadioGroupItem
                      value={item.name_category}
                      checked={item.name_category === input.category}
                      id={item.id}
                      className="flex-none"
                    />
                    <Label
                      htmlFor={item.id}
                      className="flex flex-col gap-1.5 w-full"
                    >
                      <p
                        className={cn(
                          "font-bold border-b pb-1.5 whitespace-nowrap text-ellipsis overflow-hidden w-full",
                          input.category === item.name_category
                            ? "border-gray-500"
                            : "border-gray-300",
                        )}
                      >
                        {item.name_category}
                      </p>
                      <p className="text-xs font-light flex items-center gap-1">
                        <span>{item.discount_category}%</span>
                        <span>-</span>
                        <span>
                          Max.{" "}
                          {formatRupiah(parseFloat(item.max_price_category))}
                        </span>
                      </p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </ScrollArea>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
