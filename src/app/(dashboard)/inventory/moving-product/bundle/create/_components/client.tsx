"use client";

import {
  ArrowLeft,
  ChevronDown,
  Circle,
  Loader2,
  PencilRuler,
  Plus,
  PlusCircle,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
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
import { parseAsInteger, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { useGetCreateBundle } from "../_api/use-get-create-bundle";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { useAddProduct } from "../_api/use-add-product";
import { useRemoveProduct } from "../_api/use-remove-product";
import { useSubmit } from "../_api/use-submit";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import { useGetListProduct } from "../_api/use-get-list-product";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";

const DialogProduct = dynamic(() => import("./dialog-product"), {
  ssr: false,
});

export const Client = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProduct, setIsProduct] = useState(false);

  const [input, setInput] = useState({
    name: "",
    category: "",
    color: "",
    total: "0",
    custom: "0",
  });

  // search, debounce, paginate strat ----------------------------------------------------------------

  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const [productSearch, setProductSearch] = useState("");
  const searchProductValue = useDebounce(productSearch);
  const [pageProduct, setPageProduct] = useState(1);
  const [metaPageProduct, setMetaPageProduct] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  // search, debounce, paginate end ----------------------------------------------------------------

  // confirm strat ----------------------------------------------------------------

  const [SubmitDialog, confirmSubmit] = useConfirm(
    "Create Bundle",
    "This action cannot be undone",
    "liquid",
  );

  const [DeleteProductDialog, confirmDeleteProduct] = useConfirm(
    "Remove Product From Filter",
    "This action cannot be undone",
    "destructive",
  );

  // confirm end ----------------------------------------------------------------

  // mutate strat ----------------------------------------------------------------

  const { mutate: mutateAddProduct, isPending: isPendingAddProduct } =
    useAddProduct();

  const { mutate: mutateRemoveProduct, isPending: isPendingRemoveProduct } =
    useRemoveProduct();

  const { mutate: mutateSubmit, isPending: isPendingSubmit } = useSubmit();

  // mutate end ----------------------------------------------------------------

  // query strat ----------------------------------------------------------------

  const { data, refetch, isRefetching, error, isError, isSuccess } =
    useGetCreateBundle({ p: page });

  const {
    data: dataProduct,
    refetch: refetchProduct,
    isRefetching: isRefetchingProduct,
    isLoading: isLoadingProduct,
    error: errorProduct,
    isError: isErrorProduct,
    isSuccess: isSuccessProduct,
  } = useGetListProduct({ p: pageProduct, q: searchProductValue });

  // query end ----------------------------------------------------------------

  // memeo strat ----------------------------------------------------------------

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data.data;
  }, [data]);

  const dataListCategories: any[] = useMemo(() => {
    return data?.data.data.resource.category ?? [];
  }, [data]);

  const dataListProduct: any[] = useMemo(() => {
    return dataProduct?.data.data.resource.data;
  }, [dataProduct]);

  // memo end ----------------------------------------------------------------

  // paginate strat ----------------------------------------------------------------

  useEffect(() => {
    const dataResource = data?.data.data.resource;
    setPaginate({
      isSuccess: isSuccess,
      data: data,
      dataPaginate: dataResource?.data,
      setPage: setPage,
      setMetaPage: setMetaPage,
    });
    setInput((prev) => ({
      ...prev,
      color: dataResource?.color ?? "",
      total: dataResource?.total_new_price ?? "0",
      custom: !dataResource?.category
        ? Math.round(dataResource?.fixed_price).toString()
        : Math.round(dataResource?.total_new_price).toString(),
      category: dataResource?.category ? prev.category : "",
    }));
  }, [data]);

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccessProduct,
      data: dataProduct,
      dataPaginate: dataProduct?.data.data.resource,
      setPage: setPageProduct,
      setMetaPage: setMetaPageProduct,
    });
  }, [dataProduct]);

  // paginate end ----------------------------------------------------------------

  // handling action strat ----------------------------------------------------------------

  const handleAddProduct = (id: any, source: any) => {
    mutateAddProduct(
      { id, source },
      {
        onSuccess: () => {
          handleCloseProduct();
        },
      },
    );
  };

  const handleRemoveProduct = async (id: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    mutateRemoveProduct({ id });
  };

  const handleSubmit = async () => {
    const ok = await confirmSubmit();

    if (!ok) return;

    const body = {
      category: input.category,
      name_bundle: input.name,
      name_color: input.color,
      total_price_bundle: input.total,
      total_price_custom_bundle: input.custom,
      total_product_bundle: dataList.length,
    };

    mutateSubmit({ body });
  };

  // handling action end ----------------------------------------------------------------

  // handling close strat ----------------------------------------------------------------

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
    if (isNaN(parseFloat(input.custom))) {
      setInput((prev) => ({ ...prev, custom: "0" }));
    }
  }, [input]);

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

  const columnBundle: ColumnDef<any>[] = [
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
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <Button
            className="items-center border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50"
            variant={"outline"}
            type="button"
            disabled={isPendingRemoveProduct || isPendingSubmit}
            onClick={() => {
              handleRemoveProduct(row.original.id);
            }}
          >
            {isPendingRemoveProduct ? (
              <Loader2 className="w-4 h-4 mr-1" />
            ) : (
              <Trash2 className="w-4 h-4 mr-1" />
            )}
            <div>Delete</div>
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
      accessorKey: "new_barcode_product??old_barcode_product",
      header: "Barcode",
      cell: ({ row }) =>
        row.original.new_barcode_product ?? row.original.old_barcode_product,
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
      accessorKey: "new_category_product??new_tag_product",
      header: "Category",
      cell: ({ row }) =>
        row.original.new_category_product ??
        row.original.new_tag_product ??
        "-",
    },
    {
      accessorKey: "old_price_product",
      header: "Price",
      cell: ({ row }) => formatRupiah(row.original.old_price_product),
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
      <DeleteProductDialog />
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
        isLoading={isLoadingProduct}
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
            <BreadcrumbItem>Inventory</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Moving Product</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/inventory/moving-product/bundle">
                Bundle
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Create</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
          <Link href="/inventory/moving-product/bundle">
            <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Create Bundle</h1>
        </div>
        <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
          <div className="flex items-center justify-between pb-3 mb-5 border-gray-500 border-b w-full">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                <PencilRuler className="size-4" />
              </div>
              <h5 className="font-bold text-xl">Data Bundle</h5>
            </div>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              variant={"liquid"}
              disabled={!input.name || dataList.length === 0}
            >
              <Send className="size-4 mr-1" />
              Create
            </Button>
          </div>
          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label>Bundle Name</Label>
              <Input
                className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline"
                placeholder="Bundle Name..."
                value={input.name}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="w-full flex gap-4">
              <div className="w-full flex flex-col gap-1">
                <Label>Total Price</Label>
                <Input
                  className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline disabled:opacity-100 disabled:cursor-default"
                  value={formatRupiah(parseFloat(input.total))}
                  disabled
                />
              </div>
              <div className="w-full flex flex-col gap-1">
                <Label>{input.color ? "Tag Color" : "Category"}</Label>
                {!input.color && dataListCategories.length === 0 && (
                  <Input
                    className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline disabled:opacity-100 disabled:cursor-default"
                    placeholder="Select Product First..."
                    disabled
                  />
                )}
                {input.color && (
                  <Input
                    className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline disabled:opacity-100 disabled:cursor-default"
                    value={input.color}
                    disabled
                  />
                )}
                {!input.color && dataListCategories.length > 0 && (
                  <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                      <Button className="justify-between bg-transparent shadow-none hover:bg-transparent text-black group hover:underline hover:underline-offset-2">
                        {input.category ? input.category : "Not Selected"}
                        <div className="size-8 rounded-full flex items-center justify-center group-hover:bg-sky-50">
                          <ChevronDown className="size-4" />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0"
                      style={{ width: "var(--radix-popover-trigger-width)" }}
                    >
                      <Command>
                        <CommandInput />
                        <CommandList className="p-1">
                          <CommandGroup heading="List Categories">
                            <CommandEmpty>No Data Found.</CommandEmpty>
                            {dataListCategories.map((item) => (
                              <CommandItem
                                key={item.id}
                                className="border border-gray-500 my-2 first:mt-0 last:mb-0 flex gap-2 items-center"
                                onSelect={() => {
                                  setInput((prev) => ({
                                    ...prev,
                                    category: item.name_category,
                                    custom: (
                                      parseFloat(prev.total) -
                                      (parseFloat(prev.total) / 100) *
                                        item.discount_category
                                    ).toString(),
                                  }));
                                  setIsOpen(false);
                                }}
                              >
                                <div className="size-4 rounded-full border border-gray-500 flex-none flex items-center justify-center">
                                  {input.category === item.name_category && (
                                    <Circle className="fill-black size-2.5" />
                                  )}
                                </div>
                                <div className="w-full flex flex-col gap-1">
                                  <div className="w-full font-medium">
                                    {item.name_category}
                                  </div>
                                  <Separator className="bg-gray-500" />
                                  <p className="text-xs text-start w-full text-gray-500">
                                    {item.discount_category +
                                      "% - Max. " +
                                      (formatRupiah(
                                        Math.round(item.max_price_category),
                                      ) ?? "Rp 0")}
                                  </p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </div>
          <div className="flex pt-3 mt-5 border-gray-500 border-t gap-1 w-full flex-col">
            <Label>Custom Price</Label>
            <div className="flex items-center w-full relative">
              <Input
                className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline"
                value={input.custom}
                type="number"
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    custom: e.target.value.startsWith("0")
                      ? e.target.value.replace(/^0+/, "")
                      : e.target.value,
                  }))
                }
              />
              <p className="text-sm right-3 bottom-1 absolute px-3 py-1 rounded-md bg-gray-800 text-white">
                {formatRupiah(parseFloat(input.custom))}
              </p>
            </div>
          </div>
        </div>
        <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
          <div className="flex w-full justify-between gap-4 items-center">
            <h5 className="pr-5 border-b border-gray-500 text-lg h-fit font-bold">
              List Product Filtered
            </h5>
            <div className="flex gap-4 items-center">
              <TooltipProviderPage value={"Reload Data"}>
                <Button
                  onClick={() => refetch()}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant={"outline"}
                  disabled={isPendingSubmit || isRefetching}
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      isRefetching ? "animate-spin" : "",
                    )}
                  />
                </Button>
              </TooltipProviderPage>
              <Button
                variant={"liquid"}
                disabled={isPendingSubmit || isPendingAddProduct}
                onClick={() => setIsProduct(true)}
              >
                <Plus className="size-4 mr-1" />
                Add Product
              </Button>
            </div>
          </div>
          <DataTable
            isLoading={isRefetching}
            columns={columnBundle}
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
