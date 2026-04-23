"use client";

import {
  ArrowRightFromLine,
  Loader2,
  PlusCircle,
  RefreshCw,
  ScanBarcode,
  Search,
  Truck,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { useAddProduct } from "../_api/use-add-product";
import { useRemoveProduct } from "../_api/use-remove-product";
import { useGetListProduct } from "../_api/use-get-list-product";
import { useGetDetailRacks } from "../_api/use-get-detail-rack";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePagination } from "@/lib/pagination";
import { useScanSOProduct } from "../_api/use-scan-so-product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToMigrate } from "../_api/use-to-migrate";

const DialogProduct = dynamic(() => import("./dialog-product"), {
  ssr: false,
});

export const Client = () => {
  const router = useRouter();
  const { rackId } = useParams();
  const [isProduct, setIsProduct] = useState(false);
  const addRef = useRef<HTMLInputElement | null>(null);
  const [SOProductInput, setSOProductInput] = useState("");
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // search, debounce, paginate strat ----------------------------------------------------------------

  const [addProductSearch, setAddProductSearch] = useState("");
  const searchAddProductValue = useDebounce(addProductSearch);
  const [search, setSearch] = useQueryState("q", { defaultValue: "" });
  const [productSearch, setProductSearch] = useState("");
  const searchProductValue = useDebounce(productSearch);
  const { metaPage, page, setPage, setPagination } = usePagination("p");
  const {
    metaPage: metaPageProduct,
    page: pageProduct,
    setPage: setPageProduct,
    setPagination: setPaginationProduct,
  } = usePagination("pp");

  // search, debounce, paginate end ----------------------------------------------------------------

  // confirm strat ----------------------------------------------------------------

  const [DeleteProductDialog, confirmDeleteProduct] = useConfirm(
    "Remove Product from Rack",
    "This action cannot be undone",
    "destructive",
  );

  const [ToMigrateDialog, confirmToMigrate] = useConfirm(
    "To Migrate Rack",
    "This action cannot be undone",
    "destructive",
  );

  // confirm end ----------------------------------------------------------------

  // mutate strat ----------------------------------------------------------------

  const { mutate: mutateAddProduct, isPending: isPendingAddProduct } =
    useAddProduct();
  const { mutate: mutateRemoveProduct, isPending: isPendingRemoveProduct } =
    useRemoveProduct();
  const { mutate: mutateScanSO, isPending: isPendingScanSO } =
    useScanSOProduct();
  const { mutate: mutateMigrate, isPending: isPendingMigrate } = useToMigrate();

  // mutate end ----------------------------------------------------------------

  // query strat ----------------------------------------------------------------

  const { data, refetch, isRefetching, isLoading, error, isError, isSuccess } =
    useGetDetailRacks({
      id: rackId,
      p: page,
      q: search,
    });

  const {
    data: dataProduct,
    refetch: refetchProduct,
    isRefetching: isRefetchingProduct,
    error: errorProduct,
    isError: isErrorProduct,
    isSuccess: isSuccessProduct,
  } = useGetListProduct({ id: rackId, p: pageProduct, q: searchProductValue });

  // query end ----------------------------------------------------------------

  // memeo strat ----------------------------------------------------------------

  const dataDetail: any = useMemo(() => {
    return data?.data.data.resource.rack_info;
  }, [data]);

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.products.data;
  }, [data]);

  const dataListProduct: any[] = useMemo(() => {
    return dataProduct?.data.data.resource.products.data;
  }, [dataProduct]);

  // memo end ----------------------------------------------------------------

  // paginate strat ----------------------------------------------------------------
  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data?.data.data.resource.products);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    if (dataProduct && isSuccessProduct) {
      setPaginationProduct(dataProduct?.data.data.resource.products);
    }
  }, [dataProduct, isSuccessProduct]);

  // paginate end ----------------------------------------------------------------

  // handling action strat ----------------------------------------------------------------

  const handleMigrate = async (id: any) => {
    const ok = await confirmToMigrate();

    if (!ok) return;

    mutateMigrate(
      { id },
      {
        onSuccess: (res) => {
          console.log("Migrate berhasil:", res);
          router.push("/inventory/product/color");
        },
      },
    );
  };

  const handleAddProduct = (barcode: string) => {
    const body = {
      rack_id: rackId,
      barcode: barcode,
      source: "display",
    };
    mutateAddProduct(
      { body },
      {
        onSuccess: () => {
          if (addRef.current) {
            addRef.current.focus();
          }
          setAddProductSearch("");
          handleCloseProduct();
        },
        onError: async (err: any) => {
          toast.error(
            `ERROR ${err?.status}: ${
              (err.response?.data as any).message || "Product failed to add"
            } `,
          );
        },
      },
    );
  };

  const handleRemoveProduct = async (rackId: any, productId: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    const body = {
      rack_id: rackId,
      barcode: productId,
    };

    mutateRemoveProduct({
      body,
    });
  };

  // handle scan SO Barang
  const handleScanSOProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!SOProductInput.trim()) return;

    mutateScanSO(
      { barcode: SOProductInput, rack_id: rackId },
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

  // handling action end ----------------------------------------------------------------

  // handling close strat ----------------------------------------------------------------

  const handleCloseProduct = () => {
    setIsProduct(false);
    setProductSearch("");
  };

  // handling close end ----------------------------------------------------------------

  // handle add by input
  useEffect(() => {
    if (searchAddProductValue) {
      handleAddProduct(searchAddProductValue);
    }
  }, [searchAddProductValue]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  // handle error product
  useEffect(() => {
    alertError({
      isError: isErrorProduct,
      error: errorProduct as AxiosError,
      data: "Product",
      action: "get data",
      method: "GET",
    });
  }, [isErrorProduct, errorProduct]);

  const columnSales: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(row.index + 1).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "new_barcode_product",
      header: "Barcode",
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
      accessorKey: "new_tag_product",
      header: "Tag Product",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.new_tag_product}
        </div>
      ),
    },
    {
      accessorKey: "old_price_product",
      header: "Old Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.old_price_product)}
        </div>
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
          <TooltipProviderPage value={"remove it"}>
            <Button
              className="items-center border-red-400 text-red-500 hover:bg-red-50 p-0 w-9 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              type="button"
              disabled={isPendingRemoveProduct}
              onClick={() => {
                handleRemoveProduct(rackId, row.original.new_barcode_product);
              }}
            >
              {isPendingRemoveProduct ? (
                <Loader2 className="w-4 h-4 mr-1" />
              ) : (
                <ArrowRightFromLine className="w-4 h-4 mr-1" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  const columnProduct: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPageProduct.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "new_barcode_product",
      header: "Barcode",
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
      accessorKey: "new_tag_product",
      header: "Tag Product",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.new_tag_product}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={"Add Product"}>
            <Button
              className="items-center border-sky-400 text-black hover:bg-sky-50 p-0 w-9 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                handleAddProduct(row.original.new_barcode_product);
              }}
              type="button"
              disabled={isPendingAddProduct}
            >
              {isPendingAddProduct ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
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

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 py-4">
      <DeleteProductDialog />
      <ToMigrateDialog />
      <DialogProduct
        open={isProduct}
        onCloseModal={() => {
          if (isProduct) {
            handleCloseProduct();
          }
        }}
        search={productSearch}
        setSearch={setProductSearch}
        refetch={refetchProduct}
        isRefetching={isRefetchingProduct}
        columns={columnProduct}
        dataTable={dataListProduct}
        page={pageProduct}
        metaPage={metaPageProduct}
        setPage={setPageProduct}
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
      <div className="flex flex-col gap-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Display</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/inventory/product/color">
                Color
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Detail Rack</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex w-full gap-4">
          <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
            <div className="flex items-center justify-between pb-3 mb-5 border-gray-500 border-b w-full">
              <div className="flex items-center gap-4">
                <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                  <ScanBarcode className="size-4" />
                </div>
                <h5 className="font-bold text-xl">{dataDetail?.barcode}</h5>
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
                      className={cn(
                        "w-4 h-4",
                        isRefetching ? "animate-spin" : "",
                      )}
                    />
                  </Button>
                </TooltipProviderPage>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                    onClick={() => {
                      handleMigrate(rackId);
                    }}
                    disabled={isPendingMigrate}
                  >
                    <Truck className="size-4" />
                    To Migrate
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex w-full gap-4">
              <div className="w-full flex flex-col gap-4">
                <div className="flex flex-col">
                  <p className="text-sm">Name</p>
                  <p className="font-semibold">{dataDetail?.name}</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm">Total Data</p>
                  <p className="font-semibold">{dataDetail?.total_items} </p>
                </div>
              </div>
              <div className="w-full flex flex-col gap-4">
                <div className="flex flex-col">
                  <p className="text-sm">Total New Price</p>
                  <p className="font-semibold">
                    {formatRupiah(dataDetail?.total_new_price)}{" "}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm">Total Old Price</p>
                  <p className="font-semibold">
                    {formatRupiah(dataDetail?.total_old_price)}
                  </p>
                </div>
                {/* <div className="flex flex-col">
                  <p className="text-sm">Total Display Price</p>
                  <p className="font-semibold">
                    {formatRupiah(dataDetail?.total_display_price_product)}{" "}
                  </p>
                </div> */}
                {/* <div className="flex flex-col">
                  <p className="text-sm">Status SO</p>
                  <p className="font-semibold">
                    {" "}
                    {dataDetail?.is_so === 1
                      ? "Sudah SO"
                      : dataDetail?.is_so === 0
                        ? "Belum SO"
                        : "-"}{" "}
                  </p>
                </div> */}
              </div>
            </div>
            <div className="border-t border-gray-500 w-full pt-3 mt-5">
              <div className="w-full flex justify-between items-center">
                <div
                  className={cn(
                    "flex items-center gap-2 relative group w-full max-w-xl",
                  )}
                >
                  <Label
                    htmlFor="search"
                    className="flex gap-2 absolute left-2 items-center"
                  >
                    <Badge className="bg-black text-xs hover:bg-black rounded-full text-white">
                      Add Product
                    </Badge>
                  </Label>

                  <TooltipProviderPage value={"add product by barcode input"}>
                    <Input
                      id="search"
                      ref={addRef}
                      className="rounded-r-none border-r-0 pl-28 focus-visible:ring-0 focus-visible:border focus-visible:border-sky-300 border-sky-300/80 disabled:opacity-100 w-full"
                      autoFocus
                      autoComplete="off"
                      value={addProductSearch}
                      onChange={(e) => setAddProductSearch(e.target.value)}
                    />
                  </TooltipProviderPage>

                  <Button
                    onClick={() => setIsProduct(true)}
                    className="bg-sky-300/80 w-10 p-0 hover:bg-sky-300 text-black rounded-l-none border border-sky-300/80 hover:border-sky-300 focus-visible:ring-0 disabled:opacity-100"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => refetch()}
                    className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                    variant={"outline"}
                    disabled={isRefetching}
                  >
                    <RefreshCw
                      className={cn(
                        "w-4 h-4",
                        isRefetching ? "animate-spin" : "",
                      )}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden bg-white shadow rounded-xl p-5 border border-gray-200 flex-col gap-4">
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
        <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
          <div className="flex gap-2 items-center w-full justify-between">
            <div className="flex items-center gap-3 w-full">
              <Input
                className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                    className={cn(
                      "w-4 h-4",
                      isRefetching ? "animate-spin" : "",
                    )}
                  />
                </Button>
              </TooltipProviderPage>
            </div>
          </div>
          <DataTable
            isLoading={isRefetching || isLoading}
            columns={columnSales}
            data={dataList ?? []}
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
