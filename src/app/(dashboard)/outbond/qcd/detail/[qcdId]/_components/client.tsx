"use client";

import {
  ArrowLeft,
  Loader,
  Loader2,
  PlusCircle,
  RefreshCw,
  ScanBarcode,
  Send,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGetDetailQCD } from "../_api/use-get-detail-qcd";
import { usePagination } from "@/lib/pagination";
import { useSearchQuery } from "@/lib/search";
import Pagination from "@/components/pagination";
import { Input } from "@/components/ui/input";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { useAddProduct } from "../_api/use-add-product";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetListProductDump } from "../_api/use-get-list-product";
import { useDebounce } from "@/hooks/use-debounce";
import DialogProduct from "./dialog-product";
import { useSubmit } from "../_api/use-submit";
import { useFinish } from "../_api/use-finish";
import { useRemoveProduct } from "../_api/use-delete-product-document";

export const Client = () => {
  const router = useRouter();
  const [isProduct, setIsProduct] = useState(false);
  const [dynamicMessage, setDynamicMessage] = useState(
    "This action cannot be undone",
  );
  const addRef = useRef<HTMLInputElement | null>(null);
  const { qcdId } = useParams();
  const { search, searchValue, setSearch } = useSearchQuery("");
  const { metaPage, page, setPage, setPagination } = usePagination("page");
  const [productSearch, setProductSearch] = useState("");
  const searchProductValue = useDebounce(productSearch);
  const [pageProduct, setPageProduct] = useState(1);
  const [metaPageProduct, setMetaPageProduct] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const [AddProductDialog, confirmAddProduct] = useConfirm(
    "Confirm Add Product",
    dynamicMessage,
    "liquid",
  );

  const [SubmitDialog, confirmSubmit] = useConfirm(
    "Create Qcd",
    "This action cannot be undone",
    "liquid",
  );

  const [FinishDialog, confirmFinish] = useConfirm(
    "Finish Qcd",
    "This action cannot be undone",
    "liquid",
  );

  const [DeleteProductDialog, confirmDeleteProductDialog] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "destructive",
  );

  // query start ----------------------------------------------------------------

  const {
    data,
    isSuccess,
    refetch,
    isLoading: isLoadingData,
    isRefetching,
    error,
    isError,
  } = useGetDetailQCD({
    id: qcdId,
    p: page,
    q: searchValue,
  });

  const {
    data: dataProduct,
    refetch: refetchProduct,
    isLoading: isLoadingProduct,
    isRefetching: isRefetchingProduct,
    error: errorProduct,
    isError: isErrorProduct,
    isSuccess: isSuccessProduct,
  } = useGetListProductDump({ p: pageProduct, q: searchProductValue });

  const { mutate: mutateAddProduct, isPending: isPendingAddProduct } =
    useAddProduct();
  const { mutate: mutateSubmit, isPending: isPendingSubmit } = useSubmit();
  const { mutate: mutateFinish, isPending: isPendingFinish } = useFinish();
  const { mutate: mutateRemoveProduct, isPending: isPendingRemoveProduct } =
    useRemoveProduct();

  // query end ----------------------------------------------------------------

  // handling action start ----------------------------------------------------------------

  const handleAddProduct = (ProductId: string, source: string) => {
    const body = {
      scrap_document_id: dataRes?.document?.id,
      source: source,
      product_id: ProductId,
    };
    mutateAddProduct(
      { body },
      {
        onSuccess: () => {
          if (addRef.current) {
            addRef.current.focus();
          }
          refetchProduct();
        },
        onError: async (err: any) => {
          if (err?.status === 404) {
            setDynamicMessage("Product tidak ada");
            await confirmAddProduct();
            return;
          }
        },
      },
    );
  };

  const handleSubmit = async () => {
    const ok = await confirmSubmit();

    if (!ok) return;

    const body = {
      scrap_document_id: dataRes?.document?.id,
    };

    mutateSubmit(
      { body, id: dataRes?.document?.id },
      {
        onSuccess: (res: any) => {
          const id = res?.data?.data?.resource?.id;
          router.push(`/outbond/qcd/detail/${id}`);
        },
      },
    );
  };

  const handleFinish = async () => {
    const ok = await confirmFinish();

    if (!ok) return;

    mutateFinish({ id: dataRes?.document?.id });
  };

  const handleRemoveProduct = async (row: any) => {
    const ok = await confirmDeleteProductDialog();
    if (!ok) return;

    mutateRemoveProduct(
      {
        scrap_document_id: dataRes?.document?.id,
        product_id: row.product_id ?? row.id,
        source: row.source,
      },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  // handling action end ----------------------------------------------------------------

  // memeo start ----------------------------------------------------------------

  const dataRes: any = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.items.data;
  }, [data]);

  const dataListProduct: any[] = useMemo(() => {
    return dataProduct?.data.data.resource.data;
  }, [dataProduct]);

  const isLoading = !isSuccess || isRefetching;

  // memo end ----------------------------------------------------------------

  // handling close start ----------------------------------------------------------------

  const handleCloseProduct = () => {
    setIsProduct(false);
    setProductSearch("");
    setPageProduct(1);
    setMetaPageProduct({
      from: 0,
      last: 0,
      perPage: 0,
      total: 0,
    });
  };

  // handling close end ----------------------------------------------------------------

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

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccessProduct,
      data: dataProduct,
      dataPaginate: dataProduct?.data.data.resource,
      setPage: setPageProduct,
      setMetaPage: setMetaPageProduct,
    });
  }, [dataProduct]);

  // get pagetination
  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data?.data.data.resource.items);
    }
  }, [data, isSuccess]);

  const columnQcd: ColumnDef<any>[] = [
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
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">{row.original.source}</div>
      ),
    },
    {
      accessorKey: "new_category_product",
      header: "Category",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.new_category_product}
        </div>
      ),
    },
    // {
    //   accessorKey: "new_quantity_product",
    //   header: "Qty",
    //   cell: ({ row }) => (
    //     <div className="max-w-[500px] break-all">
    //       {row.original.new_quantity_product}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "new_price_product",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.new_price_product)}
        </div>
      ),
    },
    {
      header: () => <div className="text-center">Action</div>,
      id: "action",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="border-red-400 text-red-600 hover:bg-red-50 p-0 w-9"
            disabled={isPendingRemoveProduct || isPendingSubmit}
            onClick={() => handleRemoveProduct(row.original)}
          >
            {isPendingRemoveProduct ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
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
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.new_barcode_product}
        </div>
      ),
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
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">{row.original.source}</div>
      ),
    },
    {
      accessorKey: "new_price_product",
      header: "New Price",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.new_price_product}
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
                handleAddProduct(row.original.id, row.original.source);
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
      <SubmitDialog />
      <FinishDialog />
      <DeleteProductDialog />
      <AddProductDialog />
      <DialogProduct
        open={isProduct}
        onCloseModal={() => {
          if (isProduct) {
            handleCloseProduct();
          }
        }}
        documentId={dataRes?.document?.id}
        search={productSearch}
        setSearch={setProductSearch}
        refetch={refetchProduct}
        isLoading={isLoadingProduct}
        isRefetching={isRefetchingProduct}
        columns={columnProduct}
        dataTable={dataListProduct}
        page={pageProduct}
        metaPage={metaPageProduct}
        setPage={setPageProduct}
      />
      <div className="flex flex-col gap-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Outbound</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/outbond/qcd">QCD</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Detail</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
          <Link href="/outbond/qcd">
            <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Detail QCD</h1>
        </div>
        <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
          <div className="flex items-center justify-between pb-3 mb-5 border-gray-500 border-b w-full">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                <ScanBarcode className="size-4" />
              </div>
              <h5 className="font-bold text-xl">
                {dataRes?.document?.code_document_scrap}
              </h5>
            </div>
            <div className="flex items-center gap-2"></div>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="bg-sky-400/80 hover:bg-sky-400 text-black"
            >
              <Send className="size-4 mr-1" />
              Create
            </Button>
          </div>
          <div className="flex w-full gap-4">
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-sm">Total Product</p>
                <p className="font-semibold">
                  {dataRes?.document?.total_product}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Status</p>
                <p className="font-semibold">{dataRes?.document?.status}</p>
              </div>
            </div>
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-sm">Total Old Price</p>
                <p className="font-semibold">
                  {formatRupiah(dataRes?.document?.total_old_price)}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Total New Price</p>
                <p className="font-semibold">
                  {formatRupiah(dataRes?.document?.total_new_price)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
          <h2 className="text-xl font-bold">List Product</h2>
          <div className="flex items-center gap-3 w-full">
            <Input
              className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
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
                  className={cn("w-4 h-4", isLoading ? "animate-spin" : "")}
                />
              </Button>
            </TooltipProviderPage>
            <div className="flex gap-4 items-center ml-auto">
              <Button
                className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                variant={"outline"}
                onClick={(e) => {
                  e.preventDefault();
                  handleFinish();
                }}
                disabled={isPendingSubmit || isPendingFinish}
              >
                {/* <PlusCircle className={"w-4 h-4 mr-1"} /> */}
                Finish
              </Button>
              <Button
                className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                variant={"outline"}
                onClick={() => setIsProduct(true)}
                disabled={isPendingSubmit}
              >
                <PlusCircle className={"w-4 h-4 mr-1"} />
                Add Product
              </Button>
            </div>
          </div>
          {isLoadingData ? (
            <div className="w-full h-[78vh] flex justify-center items-center">
              <Loader className="size-6 animate-spin" />
            </div>
          ) : (
            <div>
              <DataTable
                isLoading={isRefetching || isLoadingData}
                columns={columnQcd}
                data={dataList ?? []}
              />
              <Pagination
                pagination={{ ...metaPage, current: page }}
                setPagination={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
