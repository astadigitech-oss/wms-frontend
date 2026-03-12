"use client";

import {
  Upload,
  Search,
  SaveIcon,
  RefreshCcw,
  ArrowUpRightFromSquare,
  Box,
  BadgeDollarSign,
  DollarSign,
  ArrowLeft,
  ScanText,
  XCircle,
  Boxes,
  Trash2,
  Blocks,
} from "lucide-react";
import { AxiosError } from "axios";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { columnProductCargo } from "./columns";
import Loading from "@/app/(dashboard)/loading";
import { DataTable } from "@/components/data-table";
import { alertError, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import { DialogUpload, DialogProduct } from "./dialogs";

import {
  useAddBagCargo,
  useAddProductCargo,
  useGetListBagByUser,
  useRemoveBagCargo,
  useRemoveProductCargo,
  useUpdateCargo,
} from "../_api";
import { useSearch } from "@/lib/search";
import { useConfirm } from "@/hooks/use-confirm";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DialogName } from "./dialogs/dialog-name";
import { DialogListBagEdit } from "./dialogs/dialog-list-bag-edit";
import { Badge } from "@/components/ui/badge";
import { DialogCategory } from "./dialogs/dialog-category";

const initialValue = {
  buyer_id: "",
  name_buyer: "",
  discount_bulky: "0",
  category_bulky: "",
  total_old_price_bulky: "0",
  after_price_bulky: "0",
  total_product_bulky: "0",
  name_document: "",
  bulky_document_id: "",
};

export const Client = () => {
  const { cargoId } = useParams();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [dialog, setDialog] = useQueryState(
    "dialog",
    parseAsString.withDefault(""),
  );

  const [RemoveDialog, confirmRemove] = useConfirm(
    "Delete Product Cargo",
    "This action cannot be undone",
    "destructive",
  );

  const [RemoveBagDialog, confirmBagRemove] = useConfirm(
    "Delete Bag Cargo",
    "This action cannot be undone",
    "destructive",
  );

  const [AddBagDialog, confirmAddBag] = useConfirm(
    "Add Bag",
    "Are you sure you want to add a new bag?",
    "liquid",
  );
  const [selectedBagId, setSelectedBagId] = useState<string>("");
  const [input, setInput] = useState(initialValue);
  const addProductMutate = useAddProductCargo();
  const { mutate: addProduct, isPending: isPendingAddProduct } =
    addProductMutate;
  const { mutate: removeProduct, isPending: isPendingRemoveProduct } =
    useRemoveProductCargo();
  const { mutate: removeBag, isPending: isPendingRemoveBag } =
    useRemoveBagCargo();
  const { mutate: addBag, isPending: isPendingAddBag } = useAddBagCargo();
  const { mutate: updateCargo } = useUpdateCargo();

  const { search, searchValue, setSearch } = useSearch();
  const { data, isPending, isSuccess, refetch, isRefetching, error, isError, isLoading: isLoadingBag } =
    useGetListBagByUser({ cargoId, ids: selectedBagId });
  const isLoading = isPending || isRefetching;

  const listDataBulkySale: any[] = useMemo(() => {
    return data?.data.data.resource?.bag_product?.bulky_sales ?? [];
  }, [data]);

  const isBagDone = data?.data.data.resource?.bag_product?.status === "done";
  const bagProduct = data?.data.data.resource?.bag_product;

  const listIdBag: any[] = useMemo(() => {
    return data?.data.data.resource.ids ?? [];
  }, [data]);

  const getSelectedBagName = () => {
    const selectedBag = listIdBag.find(
      (bag: any) => String(bag.id) === String(selectedBagId),
    );
    return selectedBag ? selectedBag.name_bag : "";
  };
  const handleSelectCategory = async ({
    category,
    color_name,
    type,
  }: {
    category?: any;
    color_name?: string;
    type: "category" | "color";
  }) => {
    // tutup dialog category
    setDialog("");

    const ok = await confirmAddBag();
    if (!ok) return;

    const body: any = {
      bulky_document_id: cargoId,
      type,
    };

    if (category) {
      body.category_id = category.id;
    }

    if (color_name) {
      body.color_name = color_name;
    }

    addBag(
      { body },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  // const handleSelectCategory = async ({
  //   category,
  //   color_name,
  //   type,
  // }: {
  //   category?: any;
  //   color_name?: string;
  //   type: "category" | "color";
  // }) => {
  //   await new Promise((resolve) => setTimeout(resolve, 200));

  //   const ok = await confirmAddBag();
  //   if (!ok) return;

  //   const body: any = {
  //     bulky_document_id: cargoId,
  //     color_name: color_name,
  //     type,
  //   };

  //   if (category) {
  //     body.category_id = category.id;
  //   }

  //   addBag(
  //     {
  //       body,
  //     },
  //     {
  //       onSuccess: () => {
  //         refetch();
  //       },
  //     },
  //   );
  // };

  // const handleSelectCategory = async (category: any) => {
  //   const ok = await confirmAddBag();
  //   if (!ok) return;

  //   addBag(
  //     {
  //       body: {
  //         bulky_document_id: cargoId,
  //         category_id: category.id,
  //       },
  //     },
  //     {
  //       onSuccess: () => {
  //         refetch();
  //       },
  //     },
  //   );
  // };

  const handleUpdateCargo = async () => {
    updateCargo(
      {
        id: cargoId as string,
        body: {
          buyer_id: input.buyer_id,
          name_document: input.name_document,
        },
      },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  const handleAddProduct = ({
    type,
    barcode,
    file,
  }: {
    type: "product" | "file";
    barcode?: string;
    file?: File;
  }) => {
    const bodyProduct = {
      barcode_product: barcode,
      buyer_id: input.buyer_id,
      bulky_document_id: cargoId,
    };

    const bodyFile = new FormData();
    if (file) {
      bodyFile.append("file_import", file);
    }
    bodyFile.append("buyer_id", input.buyer_id);
    bodyFile.append(
      "bulky_document_id",
      typeof cargoId === "string"
        ? cargoId
        : Array.isArray(cargoId)
          ? (cargoId[0] ?? "")
          : "",
    );

    addProduct(
      { body: type === "product" ? bodyProduct : bodyFile },
      {
        onSuccess: () => {
          if (dialog === "product") {
            setDialog("");
          }
          setSearch("");
          if (searchRef.current) {
            searchRef.current.focus();
          }
        },
      },
    );
  };

  const handleRemoveProduct = async (id: string) => {
    const ok = await confirmRemove();

    if (!ok) return;

    removeProduct({ id });
  };

  const handleRemoveBag = async (id: string) => {
    const ok = await confirmBagRemove();

    if (!ok) return;

    removeBag({ id });
  };

  const handleReset = () => {
    setSelectedBagId("");
  };

  useEffect(() => {
    if (selectedBagId) {
      refetch();
    }
  }, [selectedBagId, refetch]);

  useEffect(() => {
    if (searchValue) {
      handleAddProduct({ type: "product", barcode: searchValue });
    }
  }, [searchValue]);

  useEffect(() => {
    if (data && data.data.data.resource && isSuccess) {
      setInput(data.data.data.resource.bulky_document);
    } else {
      setInput(initialValue);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data Buyer",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col justify-center bg-gray-100 w-full relative px-4 gap-4 py-4">
      <RemoveDialog />
      <RemoveBagDialog />
      <AddBagDialog />
      <DialogCategory
        open={dialog === "category"}
        onOpenChange={() => {
          if (dialog === "category") {
            setDialog("");
          }
        }}
        onSelectCategory={handleSelectCategory}
      />
      <DialogProduct
        open={dialog === "product"}
        onOpenChange={() => {
          if (dialog === "product") {
            setDialog("");
          }
        }}
        cargoId={cargoId}
        isPendingAddProduct={isPendingAddProduct}
        handleAddProduct={handleAddProduct}
      />
      <DialogUpload
        open={dialog === "upload"}
        onOpenChange={() => {
          if (dialog === "upload") {
            setDialog("");
          }
        }}
        handleAddProduct={handleAddProduct}
        addProductMutate={addProductMutate}
      />
      <DialogName
        open={dialog === "name"}
        onOpenChange={() => {
          if (dialog === "name") {
            setDialog("");
          }
        }}
        data={input}
        setData={setInput}
      />
      <DialogListBagEdit
        open={dialog === "list-edit-bag"}
        onOpenChange={() => {
          if (dialog === "list-edit-bag") {
            setDialog("");
          }
        }}
        listIdBag={listIdBag}
        selectedBagId={selectedBagId}
        onSelectBag={(id: string) => {
          setSelectedBagId(id);
          setDialog("");
        }}
        onRefetch={refetch}
        isLoadingBag={isLoadingBag}
        isRefetchingBag={isRefetching}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/outbond/cargo">Cargo</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Update</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full relative flex flex-col gap-4">
        <div className="p-4 bg-white rounded shadow flex flex-col gap-4">
          <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
            <Link href="/outbond/cargo">
              <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
                <ArrowLeft className="w-5 h-5 text-black" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Update Cargo</h1>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap">
              <div className="flex items-center gap-4">
                <TooltipProviderPage
                  value={
                    !input.name_document ? (
                      "Add Name Bulky"
                    ) : (
                      <div className="flex flex-col max-w-72">
                        <p>Name Bulky: {input.name_document}</p>
                        {listDataBulkySale.length > 0 && (
                          <p className="text-red-300">
                            (Delete all product to change)
                          </p>
                        )}
                      </div>
                    )
                  }
                >
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-100"
                    onClick={() => setDialog("name")}
                    // disabled={listDataBulkySale.length > 0}
                  >
                    <ScanText />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p className="min-w-5 max-w-52 truncate">
                      {input.name_document ? input.name_document : "&quot;-"}
                    </p>
                  </Button>
                </TooltipProviderPage>
                <TooltipProviderPage value={"Category Bag"}>
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:opacity-100"
                    disabled
                  >
                    <Blocks />
                    <Separator orientation="vertical" className="bg-gray-500" />
                    <p className="min-w-5">{bagProduct?.category_bag || ""} </p>
                  </Button>
                </TooltipProviderPage>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateCargo} variant={"liquid"}>
                  <SaveIcon />
                  Update
                </Button>
              </div>
            </div>
            <Separator className="bg-sky-400/80" />
            <div className="flex items-center gap-4">
              <TooltipProviderPage value={"Total Product"}>
                <Button
                  variant={"outline"}
                  className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:opacity-100"
                  disabled
                >
                  <Boxes />
                  <Separator orientation="vertical" className="bg-gray-500" />
                  <p className="min-w-5">
                    {parseFloat(input.total_product_bulky).toLocaleString()}
                  </p>
                </Button>
              </TooltipProviderPage>
              <TooltipProviderPage value={"Total all product price"}>
                <Button
                  variant={"outline"}
                  className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:opacity-100"
                  disabled
                >
                  <BadgeDollarSign />
                  <Separator orientation="vertical" className="bg-gray-500" />
                  <p className="min-w-5">
                    {formatRupiah(parseFloat(input.total_old_price_bulky))}
                  </p>
                </Button>
              </TooltipProviderPage>
              <TooltipProviderPage value={"Total final price"}>
                <Button
                  variant={"outline"}
                  className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:opacity-100"
                  disabled
                >
                  <DollarSign />
                  <Separator orientation="vertical" className="bg-gray-500" />
                  <p className="min-w-5">
                    {formatRupiah(
                      parseFloat(input.total_old_price_bulky) *
                        (1 - parseFloat(input.discount_bulky || "0") / 100),
                    )}
                  </p>
                </Button>
              </TooltipProviderPage>
              <Button
                variant={"outline"}
                className="border-sky-400/80 hover:bg-sky-50 disabled:pointer-events-auto disabled:hover:bg-transparent disabled:opacity-100"
                onClick={() => setDialog("list-edit-bag")}
              >
                <Box className="h-4 w-4 mr-2" />
                Bag
                {selectedBagId && (
                  <>
                    <Separator
                      orientation="vertical"
                      className="mx-2 bg-gray-500 w-[1.5px]"
                    />
                    <Badge className="rounded w-24 px-0 justify-center text-black font-normal capitalize bg-sky-400 hover:bg-sky-400">
                      {getSelectedBagName() || "-"}
                    </Badge>
                  </>
                )}
              </Button>
              {selectedBagId && (
                <Button
                  variant={"ghost"}
                  className="flex px-3"
                  onClick={handleReset}
                >
                  Reset
                  <XCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
              <Button onClick={() => setDialog("category")} variant={"liquid"}>
                <Box className={isPendingAddBag ? "animate-spin" : ""} />
                Add Bag
              </Button>
              <Button
                onClick={() => handleRemoveBag(bagProduct?.id)}
                variant={"destructive"}
              >
                <Trash2 className={isPendingRemoveBag ? "animate-spin" : ""} />
                Delete Bag
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-b rounded-tr shadow flex flex-col gap-4">
          {bagProduct == null ? (
            <div className="flex items-center justify-center w-full min-h-[60px]">
              <span className="text-sm text-gray-500">
                Silakan buat bag terlebih dahulu sebelum menambah produk.
              </span>
            </div>
          ) : (
            !isBagDone && (
              <div className="flex items-center gap-4 w-full opacity-100">
                <div className="flex items-center w-full">
                  <TooltipProviderPage value={"Add Product"}>
                    <div className="relative flex w-full items-center">
                      <Search className="absolute size-4 ml-3" />
                      <Input
                        ref={searchRef}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-0 border-r-0 rounded-r-none pl-10 disabled:opacity-100"
                      />
                    </div>
                  </TooltipProviderPage>
                  <TooltipProviderPage value={"Open List Products"}>
                    <Button
                      size={"icon"}
                      variant={"liquid"}
                      className="rounded-l-none"
                      onClick={() => setDialog("product")}
                    >
                      <ArrowUpRightFromSquare />
                    </Button>
                  </TooltipProviderPage>
                </div>
                <TooltipProviderPage value={"Reload Data"}>
                  <Button
                    variant={"outline"}
                    className="border-sky-400/80 hover:border-sky-400 hover:bg-sky-50 flex-none"
                    size={"icon"}
                    onClick={() => refetch()}
                  >
                    <RefreshCcw className={isLoading ? "animate-spin" : ""} />
                  </Button>
                </TooltipProviderPage>
                <Button variant={"liquid"} onClick={() => setDialog("upload")}>
                  <Upload />
                  Import File
                </Button>
              </div>
            )
          )}
          <DataTable
            columns={columnProductCargo({
              handleRemoveProduct,
              isLoading: isPendingRemoveProduct,
            })}
            data={listDataBulkySale ?? []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
