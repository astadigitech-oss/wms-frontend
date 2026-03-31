"use client";

import {
  FileDown,
  HistoryIcon,
  Loader2,
  Pencil,
  PlusCircle,
  Printer,
  ReceiptText,
  RefreshCw,
  Trash2,
  Truck,
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
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetListProductColorWMS } from "../_api/use-get-list-product-color-wms";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetListProductColorAPK } from "../_api/use-get-list-product-color-apk";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/pagination";
import { useDeleteProductColor } from "../_api/use-delete-product-color";
import { useGetProductColorDetail } from "../_api/use-get-product-color-detail";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useGetListRacks } from "../_api/use-get-list-racks";
import DialogBarcode from "./dialog-barcode";
import DialogCreateEdit from "./dialog-create-edit";
import { useCreateRack } from "../_api/use-create-rack";
import { useUpdateRack } from "../_api/use-update-rack";
import { useToMigrate } from "../_api/use-to-migrate";

const DialogDetail = dynamic(() => import("./dialog-detail"), {
  ssr: false,
});

export const Client = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useQueryState(
    "dialog",
    parseAsString.withDefault(""),
  );
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [selectedNameRack, setSelectedNameRack] = useState("");
  const [selectedBarcode, setSelectedBarcode] = useState("");
  const [selectedTotalProduct, setSelectedTotalProduct] = useState("");
  const [rackId, setRackId] = useState<string | null>(null);
  const [input, setInput] = useState<any>({ name: "" });

  // dialog to migrate
    const [ToMigrateDialog, confirmToMigrate] = useConfirm(
      "To Migrate Rack",
      "This action cannot be undone",
      "destructive",
    )

  // type color APK || WMS
  const [isApk] = useQueryState("apk", parseAsBoolean.withDefault(false));

  // dialog edit
  const [openDialog, setOpenDialog] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false),
  );

  // color ID Edit
  const [productId, setProductId] = useQueryState("productId", {
    defaultValue: "",
  });

  // search WMS
  const [dataSearchWMS, setDataSearchWMS] = useQueryState("q", {
    defaultValue: "",
  });
  const searchValueWMS = useDebounce(dataSearchWMS);
  const [pageWMS, setPageWMS] = useQueryState(
    "p",
    parseAsInteger.withDefault(1),
  );
  const [metaPageWMS, setMetaPageWMS] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const [dataSearchRackWMS, setDataSearchRackWMS] = useQueryState("q", {
    defaultValue: "",
  });
  const searchValueRackWMS = useDebounce(dataSearchRackWMS);

  const [pageRackWms, setPageRackWms] = useQueryState(
    "p",
    parseAsInteger.withDefault(1),
  );
  const [metaPageRackWms, setMetaPageRackWms] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  // search APK
  const [dataSearchAPK, setDataSearchAPK] = useQueryState("q2", {
    defaultValue: "",
  });
  const searchValueAPK = useDebounce(dataSearchAPK);
  const [pageAPK, setPageAPK] = useQueryState(
    "p2",
    parseAsInteger.withDefault(1),
  );
  const [metaPageAPK, setMetaPageAPK] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  // dialog delete
  const [DeleteDialog, confirmDelete] = useConfirm(
    `Delete Product Color ${isApk ? "APK" : "WMS"}`,
    "This action cannot be undone",
    "destructive",
  );

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useDeleteProductColor();
  const { mutate: mutateCreate, isPending: isPendingCreate } = useCreateRack();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useUpdateRack();
  const { mutate: mutateToMigrate, isPending: isPendingToMigrate } = useToMigrate();

  // data WMS
  const {
    data: dataWMS,
    refetch: refetchWMS,
    isLoading: isLoadingWMS,
    isRefetching: isRefetchingWMS,
    isPending: isPendingWMS,
    isSuccess: isSuccessWMS,
    error: errorWMS,
    isError: isErrorWMS,
  } = useGetListProductColorWMS({ p: pageWMS, q: searchValueWMS });

  // data APK
  const {
    data: dataAPK,
    refetch: refetchAPK,
    isLoading: isLoadingAPK,
    isRefetching: isRefetchingAPK,
    isPending: isPendingAPK,
    isSuccess: isSuccessAPK,
    error: errorAPK,
    isError: isErrorAPK,
  } = useGetListProductColorAPK({ p: pageAPK, q: searchValueAPK });

  // data WMS
  const {
    data: dataRacksWMS,
    refetch: refetchRacksWMS,
    isLoading: isLoadingRacksWMS,
    isRefetching: isRefetchingRacksWMS,
    isSuccess: isSuccessRacksWMS,
    isPending: isPendingRacksWMS,
    error: errorRacksWMS,
    isError: isErrorRacksWMS,
  } = useGetListRacks({ p: pageRackWms, q: searchValueRackWMS });

  // data detail
  const {
    data: dataProduct,
    isLoading: isLoadingProduct,
    isError: isErrorProduct,
    error: errorProduct,
  } = useGetProductColorDetail({ id: productId });

  // data RES memo WMS
  const dataDetail: any = useMemo(() => {
    return dataProduct?.data.data.resource;
  }, [dataProduct]);

  // data RES memo WMS
  const dataResWMS: any = useMemo(() => {
    return dataWMS?.data.data.resource;
  }, [dataWMS]);

  // data RES memo APK
  const dataResAPK: any = useMemo(() => {
    return dataAPK?.data.data.resource;
  }, [dataAPK]);

  // data Summary memo WMS
  const dataListSummartWMS: any[] = useMemo(() => {
    return dataWMS?.data.data.resource.tag_color;
  }, [dataWMS]);
  // data Summary memo WMS
  const dataListSummartWMSTag: any[] = useMemo(() => {
    return dataWMS?.data.data.resource.tag_sku;
  }, [dataWMS]);

  // data Summary memo APK
  const dataListSummartAPK: any[] = useMemo(() => {
    return dataAPK?.data.data.resource.tag_color;
  }, [dataAPK]);

  // data memo WMS
  const dataListWMS: any[] = useMemo(() => {
    return dataWMS?.data.data.resource.data_color;
  }, [dataWMS]);

  // data memo APK
  const dataListAPK: any[] = useMemo(() => {
    return dataAPK?.data.data.resource.data_color;
  }, [dataAPK]);

  // data memo WMS SKu
  const dataListSkuWMS: any[] = useMemo(() => {
    return dataWMS?.data.data.resource.data_sku;
  }, [dataWMS]);

  // data memo APK Sku
  const dataListSkuAPK: any[] = useMemo(() => {
    return dataAPK?.data.data.resource.data_sku;
  }, [dataAPK]);

  // data memo Racks WMS
  const dataListRacksWMS: any[] = useMemo(() => {
    return dataRacksWMS?.data.data.resource.racks.data;
  }, [dataRacksWMS]);

  console.log("dataListRacksWMS:", dataListRacksWMS);

  // loading WMS APK
  const loadingWMS = isLoadingWMS || isRefetchingWMS || isPendingWMS;
  const loadingAPK = isLoadingAPK || isRefetchingAPK || isPendingAPK;

  // pagination
  useEffect(() => {
    setPaginate({
      isSuccess: isSuccessWMS,
      data: dataWMS,
      dataPaginate: dataWMS?.data.data.resource.pagination,
      setPage: setPageWMS,
      setMetaPage: setMetaPageWMS,
    });
  }, [dataWMS]);

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccessAPK,
      data: dataAPK,
      dataPaginate: dataAPK?.data.data.resource.pagination,
      setPage: setPageAPK,
      setMetaPage: setMetaPageAPK,
    });
  }, [dataAPK]);

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccessRacksWMS,
      data: dataRacksWMS,
      dataPaginate: dataRacksWMS?.data.data.resource.racks,
      setPage: setPageRackWms,
      setMetaPage: setMetaPageRackWms,
    });
  }, [dataRacksWMS]);

  useEffect(() => {
    alertError({
      isError: isErrorWMS,
      error: errorWMS as AxiosError,
      data: "Data WMS",
      action: "get data",
      method: "GET",
    });
  }, [isErrorWMS, errorWMS]);

  useEffect(() => {
    alertError({
      isError: isErrorAPK,
      error: errorAPK as AxiosError,
      data: "Data APK",
      action: "get data",
      method: "GET",
    });
  }, [isErrorAPK, errorAPK]);
  useEffect(() => {
    alertError({
      isError: isErrorProduct,
      error: errorProduct as AxiosError,
      data: "Data Product",
      action: "get data",
      method: "GET",
    });
  }, [isErrorProduct, errorProduct]);

  useEffect(() => {
    alertError({
      isError: isErrorRacksWMS,
      error: errorRacksWMS as AxiosError,
      data: "Data Racks WMS",
      action: "get data",
      method: "GET",
    });
  }, [isErrorRacksWMS, errorRacksWMS]);

  // handle delete color
  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete(
      { id },
      {
        onSuccess: (data) => {
          toast.success(
            `Product Color ${isApk ? "APK" : "WMS"} successfully deleted`,
          );
          queryClient.invalidateQueries({
            queryKey: [
              isApk ? "list-product-color-apk" : "list-product-color-wms",
            ],
          });
          queryClient.invalidateQueries({
            queryKey: ["product-color-detail", data.data.data.resource.id],
          });
        },
        onError: (err) => {
          if (err.status === 403) {
            toast.error(`Error 403: Restricted Access`);
          } else {
            toast.error(
              `ERROR ${err?.status}: Product Color ${
                isApk ? "APK" : "WMS"
              } failed to delete`,
            );
            console.log(
              `ERROR_PRODUCT_COLOR_DELETED_${isApk ? "APK" : "WMS"}:`,
              err,
            );
          }
        },
      },
    );
  };

   const handleToMigrate = async (id: any) => {
    const ok = await confirmToMigrate();

    if (!ok) return;
    mutateToMigrate({ id });
  };

  // handle close
  const handleClose = () => {
    setIsOpen("");
    setInput((prev: any) => ({
      ...prev,
      name: "",
    }));
  };

  // handle create
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      name: input.name,
    };
    mutateCreate(
      { body },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  // handle update
  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      name: input.name,
    };
    mutateUpdate(
      { id: rackId as string, body },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  const columnSummaryColor: ColumnDef<any>[] = [
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
      accessorKey: "tag_name",
      header: "Color Name",
      cell: ({ row }) => (
        <div className="break-all">{row.original.tag_name}</div>
      ),
    },
    {
      accessorKey: "total_data",
      header: () => <div className="text-center">Total Data</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.total_data.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "total_price",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.total_price)}
        </div>
      ),
    },
  ];
  const columnSummarySku: ColumnDef<any>[] = [
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
      accessorKey: "tag_name",
      header: "SKU Name",
      cell: ({ row }) => (
        <div className="break-all">{row.original.tag_name}</div>
      ),
    },
    {
      accessorKey: "total_data",
      header: () => <div className="text-center">Total Data</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.total_data.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "total_price",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.total_price)}
        </div>
      ),
    },
  ];
  const columnListProductColorWMS: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {/* {(metaPageWMS.from + row.index).toLocaleString()} */}
          {(1 + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "old_barcode_product",
      header: "Old Barcode",
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
      header: "Tag Color",
    },
    {
      accessorKey: "new_price_product",
      header: "New Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.new_price_product)}
        </div>
      ),
    },
    {
      accessorKey: "new_status_product",
      header: "New Price",
      cell: ({ row }) => (
        <Badge className="bg-sky-400/80 hover:bg-sky-400/80 text-black font-normal capitalize">
          {row.original.new_status_product}
        </Badge>
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
              disabled={isLoadingProduct}
              onClick={(e) => {
                e.preventDefault();
                setProductId(row.original.id);
                setOpenDialog(true);
              }}
            >
              {isLoadingProduct ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ReceiptText className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Delete</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingDelete}
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id);
              }}
            >
              {isPendingDelete ? (
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
  const columnListProductColorAPK: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {/* {(metaPageAPK.from + row.index).toLocaleString()} */}
          {(1 + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "old_barcode_product",
      header: "Old Barcode",
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
      header: "Tag Color",
    },
    {
      accessorKey: "new_price_product",
      header: "New Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.new_price_product)}
        </div>
      ),
    },
    {
      accessorKey: "new_status_product",
      header: "New Price",
      cell: ({ row }) => (
        <Badge className="bg-sky-400/80 hover:bg-sky-400/80 text-black font-normal capitalize">
          {row.original.new_status_product}
        </Badge>
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
              disabled={isLoadingProduct}
              onClick={(e) => {
                e.preventDefault();
                setProductId(row.original.id);
                setOpenDialog(true);
              }}
            >
              {isLoadingProduct ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ReceiptText className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Delete</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingDelete}
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id);
              }}
            >
              {isPendingDelete ? (
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
  const columnListProductSkuWMS: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPageWMS.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "old_barcode_product",
      header: "Old Barcode",
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
      header: "Tag SKU",
    },
    {
      accessorKey: "new_price_product",
      header: "New Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.new_price_product)}
        </div>
      ),
    },
    {
      accessorKey: "new_status_product",
      header: "New Price",
      cell: ({ row }) => (
        <Badge className="bg-sky-400/80 hover:bg-sky-400/80 text-black font-normal capitalize">
          {row.original.new_status_product}
        </Badge>
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
              disabled={isLoadingProduct}
              onClick={(e) => {
                e.preventDefault();
                setProductId(row.original.id);
                setOpenDialog(true);
              }}
            >
              {isLoadingProduct ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ReceiptText className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Delete</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingDelete}
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id);
              }}
            >
              {isPendingDelete ? (
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
  const columnListProductSkuAPK: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPageAPK.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "old_barcode_product",
      header: "Old Barcode",
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
      header: "Tag SKU",
    },
    {
      accessorKey: "new_price_product",
      header: "New Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.new_price_product)}
        </div>
      ),
    },
    {
      accessorKey: "new_status_product",
      header: "New Price",
      cell: ({ row }) => (
        <Badge className="bg-sky-400/80 hover:bg-sky-400/80 text-black font-normal capitalize">
          {row.original.new_status_product}
        </Badge>
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
              disabled={isLoadingProduct}
              onClick={(e) => {
                e.preventDefault();
                setProductId(row.original.id);
                setOpenDialog(true);
              }}
            >
              {isLoadingProduct ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ReceiptText className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Delete</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingDelete}
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id);
              }}
            >
              {isPendingDelete ? (
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
  const columnRackColor = ({ metaPage }: any): ColumnDef<any>[] => [
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
      accessorKey: "new_barcode_product||old_barcode_product",
      header: "Barcode",
      cell: ({ row }) => row.original.barcode ?? "-",
    },
    {
      accessorKey: "name",
      header: "Name Rack ",
      cell: ({ row }) => (
        <div className="max-w-[400px] break-all">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "total_items",
      header: "Total Data",
      cell: ({ row }) => row.original.total_items ?? "-",
    },
    {
      accessorKey: "total_old_price",
      header: "Old Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.total_old_price ?? 0)}
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
          <TooltipProviderPage value={<p>Detail</p>}>
            <Button
              asChild
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
            >
              <Link
                href={`/inventory/product/color/details/${row.original.id}`}
              >
                <ReceiptText className="w-4 h-4" />
              </Link>
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Edit</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();

                // set id rack yang mau di edit
                setRackId(row.original.id);

                // karena sekarang hanya pakai name
                setInput({
                  name: row.original.name ?? "",
                });

                // buka dialog
                setIsOpen("create-edit");
              }}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Print</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingRacksWMS}
              onClick={(e) => {
                e.preventDefault();
                setSelectedBarcode(row.original.barcode);
                setSelectedNameRack(row.original.name);
                setSelectedTotalProduct(row.original.total_items);
                setBarcodeOpen(true);
              }}
            >
              {isPendingRacksWMS ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>To Migrate</p>}>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleToMigrate(row.original.id);
              }}
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              asChild
              disabled={isPendingToMigrate}
            >
              <Truck className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
          {/* <TooltipProviderPage value={<p>Delete</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingDelete}
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id);
              }}
            >
              {isPendingDelete ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage> */}
          {/* <TooltipProviderPage value={<p>Stock Opname</p>}>
            <Button
              className="hidden items-center w-9 px-0 flex-none h-9 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-100 disabled:hover:bg-yellow-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingStockOpname}
              onClick={(e) => {
                e.preventDefault();
                handleStockOpname(row.original.id);
              }}
            >
              {isPendingStockOpname ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BookMarked className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage> */}
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

  if (
    (isErrorWMS && (errorWMS as AxiosError)?.status === 403) ||
    (isErrorAPK && (errorAPK as AxiosError)?.status === 403)
  ) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <DeleteDialog />
      <ToMigrateDialog />
      <DialogDetail
        open={openDialog}
        onCloseModal={() => {
          if (openDialog) {
            setOpenDialog(false);
          }
        }}
        data={dataDetail}
        isLoading={isLoadingProduct}
      />
      <DialogBarcode
        onCloseModal={() => {
          if (barcodeOpen) {
            setBarcodeOpen(false);
          }
        }}
        open={barcodeOpen}
        barcode={selectedBarcode}
        qty={selectedTotalProduct}
        name={selectedNameRack}
        handleCancel={() => {
          setBarcodeOpen(false);
        }}
      />
      <DialogCreateEdit
        open={isOpen === "create-edit"}
        onOpenChange={() => {
          if (isOpen === "create-edit") {
            setIsOpen("");
            setRackId(null);
            setInput({ name: "" });
          }
        }}
        rackId={rackId}
        input={input}
        setInput={setInput}
        handleCreate={handleCreate}
        handleUpdate={handleUpdate}
        isPendingCreate={isPendingCreate}
        isPendingUpdate={isPendingUpdate}
      />
      <Tabs defaultValue={isApk ? "apk" : "wms"} className="w-full">
        <TabsContent value="wms">
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
              <BreadcrumbItem>Color WMS</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </TabsContent>
        <TabsContent value="apk">
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
              <BreadcrumbItem>Color APK</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </TabsContent>
        {/* <div className="flex w-full bg-sky-400 rounded overflow-hidden shadow-md px-5 py-3 justify-between items-center mb-4 mt-4 sticky top-5 z-10 border">
          <div className="flex items-center">
            <AlertCircle className="size-4 mr-2" />
            <p className="text-sm font-medium">Please select the type first</p>
          </div>
          <TabsList className="gap-4 bg-transparent">
            <TabsTrigger value="wms" asChild>
              <Button
                onClick={() => {
                  setDataSearchAPK("");
                  setDataSearchWMS("");
                  setIsApk(false);
                }}
                className="data-[state=active]:hover:bg-sky-100 data-[state=active]:bg-sky-200 bg-transparent hover:bg-sky-300 text-black shadow-none"
              >
                <Monitor className="size-4 mr-2" />
                WMS
              </Button>
            </TabsTrigger>
            <TabsTrigger value="apk" asChild>
              <Button
                onClick={() => {
                  setDataSearchAPK("");
                  setDataSearchWMS("");
                  setIsApk(true);
                }}
                className="data-[state=active]:hover:bg-sky-100 data-[state=active]:bg-sky-200 bg-transparent hover:bg-sky-300 text-black shadow-none"
              >
                <Smartphone className="size-4 mr-2" />
                APK
              </Button>
            </TabsTrigger>
          </TabsList>
        </div> */}
        <TabsContent value="wms">
          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-6 flex-col">
              <h2 className="text-xl font-bold">Summary Product Colors WMS</h2>
              <div className="flex flex-col w-full gap-4">
                <div className="flex w-full gap-4">
                  <div className="w-full border border-sky-400 p-3 rounded-md">
                    <h5 className="text-sm">Total Product</h5>
                    <p className="font-semibold text-lg">
                      {dataResWMS?.total_data.toLocaleString()} Products
                    </p>
                  </div>
                  <div className="w-full border border-sky-400 p-3 rounded-md">
                    <h5 className="text-sm">Total Value</h5>
                    <p className="font-semibold text-lg">
                      {formatRupiah(dataResWMS?.total_price)}
                    </p>
                  </div>
                </div>
                <DataTable
                  columns={columnSummaryColor}
                  data={dataListSummartWMS ?? []}
                />
                <DataTable
                  columns={columnSummarySku}
                  data={dataListSummartWMSTag ?? []}
                />
              </div>
            </div>
            <Tabs className="w-full mt-14" defaultValue="rack">
              <div className="relative w-full flex justify-center">
                <TabsList className="absolute -top-12 p-1 h-auto border-2 border-white shadow bg-gray-200">
                  <TabsTrigger
                    className="px-5 py-2 data-[state=active]:text-black text-gray-700"
                    value="rack"
                  >
                    List Rak
                  </TabsTrigger>
                  <TabsTrigger
                    className="px-5 py-2 data-[state=active]:text-black text-gray-700"
                    value="product"
                  >
                    List Product
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="rack" className="w-full gap-4 flex flex-col">
                <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
                  <h2 className="text-xl font-bold">List Rak Colors WMS</h2>
                  <div className="flex flex-col w-full gap-4">
                    <div className="w-full flex flex-col gap-4">
                      <div className="flex items-center gap-3 w-full">
                        <Input
                          className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                          value={searchValueRackWMS}
                          onChange={(e) => {
                            setDataSearchRackWMS(e.target.value);
                          }}
                          placeholder="Search..."
                          autoFocus
                        />
                        <TooltipProviderPage value={"Reload Data"}>
                          <Button
                            onClick={() => refetchRacksWMS()}
                            className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                            variant={"outline"}
                          >
                            <RefreshCw
                              className={cn(
                                "w-4 h-4",
                                isLoadingRacksWMS || isRefetchingRacksWMS
                                  ? "animate-spin"
                                  : "",
                              )}
                            />
                          </Button>
                        </TooltipProviderPage>
                        <div className="flex gap-4 items-center ml-auto">
                          <TooltipProviderPage
                            value={"Export Rack"}
                            side="left"
                          >
                            <Button
                              // onClick={(e) => {
                              //   e.preventDefault();
                              //   handleExportRack();
                              // }}
                              className="hidden items-center w-9 px-0 flex-none h-9 border-sky-400 text-black bg-sky-100 hover:bg-sky-200 disabled:opacity-100 disabled:hover:bg-sky-200 disabled:pointer-events-auto disabled:cursor-not-allowed"
                              // disabled={isPendingExportRack}
                              variant={"outline"}
                            >
                              {/* {isPendingExportRack ? (
                                <Loader2
                                  className={cn("w-4 h-4 animate-spin")}
                                />
                              ) : ( */}
                              <FileDown className={cn("w-4 h-4")} />
                              {/* )} */}
                            </Button>
                          </TooltipProviderPage>
                          <Button
                            onClick={() => setIsOpen("create-edit")}
                            className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                            variant={"outline"}
                            disabled={
                              isPendingRacksWMS ||
                              isRefetchingRacksWMS ||
                              isPendingCreate
                            }
                          >
                            <PlusCircle className={"w-4 h-4 mr-1"} />
                            Add Rack
                          </Button>
                          <Button
                            asChild
                            className="bg-sky-400 hover:bg-sky-400/80 text-black hidden"
                          >
                            <Link href={`/inventory/product/rack/history`}>
                              <HistoryIcon className="w-4 h-4 ml-2" />
                              History Rack
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                    <DataTable
                      columns={columnRackColor({
                        metaPage: metaPageRackWms,
                        setPage: setPageRackWms,
                      })}
                      data={dataListRacksWMS ?? []}
                      isLoading={loadingWMS}
                    />
                    <Pagination
                      pagination={{ ...metaPageWMS, current: pageWMS }}
                      setPagination={setPageWMS}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent
                value="product"
                className="w-full gap-4 flex flex-col"
              >
                <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
                  <h2 className="text-xl font-bold">List Product Colors WMS</h2>
                  <div className="flex flex-col w-full gap-4">
                    <div className="flex gap-2 items-center w-full justify-between">
                      <div className="flex items-center gap-3 w-full">
                        <Input
                          className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                          value={dataSearchWMS}
                          onChange={(e) => setDataSearchWMS(e.target.value)}
                          placeholder="Search..."
                          autoFocus
                        />
                        <TooltipProviderPage value={"Reload Data"}>
                          <Button
                            onClick={() => refetchWMS()}
                            className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                            variant={"outline"}
                          >
                            <RefreshCw
                              className={cn(
                                "w-4 h-4",
                                loadingWMS ? "animate-spin" : "",
                              )}
                            />
                          </Button>
                        </TooltipProviderPage>
                      </div>
                    </div>
                    <DataTable
                      columns={columnListProductColorWMS}
                      data={dataListWMS ?? []}
                      isLoading={loadingWMS}
                    />
                    <DataTable
                      columns={columnListProductSkuWMS}
                      data={dataListSkuWMS ?? []}
                      isLoading={loadingWMS}
                    />
                    <Pagination
                      pagination={{ ...metaPageWMS, current: pageWMS }}
                      setPagination={setPageWMS}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        <TabsContent value="apk">
          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-6 flex-col">
              <h2 className="text-xl font-bold">Summary Product Colors APK</h2>
              <div className="flex flex-col w-full gap-4">
                <div className="flex w-full gap-4">
                  <div className="w-full border border-sky-400 p-3 rounded-md">
                    <h5 className="text-sm">Total Product</h5>
                    <p className="font-semibold text-lg">
                      {dataResAPK?.total_data.toLocaleString()} Products
                    </p>
                  </div>
                  <div className="w-full border border-sky-400 p-3 rounded-md">
                    <h5 className="text-sm">Total Value</h5>
                    <p className="font-semibold text-lg">
                      {formatRupiah(dataResAPK?.total_price)}
                    </p>
                  </div>
                </div>
                <DataTable
                  columns={columnSummaryColor}
                  data={dataListSummartAPK ?? []}
                />
              </div>
            </div>
            <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
              <h2 className="text-xl font-bold">List Product Colors APK</h2>
              <div className="flex flex-col w-full gap-4">
                <div className="flex gap-2 items-center w-full justify-between">
                  <div className="flex items-center gap-3 w-full">
                    <Input
                      className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                      value={dataSearchAPK}
                      onChange={(e) => setDataSearchAPK(e.target.value)}
                      placeholder="Search..."
                      autoFocus
                    />
                    <TooltipProviderPage value={"Reload Data"}>
                      <Button
                        onClick={() => refetchAPK()}
                        className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                        variant={"outline"}
                      >
                        <RefreshCw
                          className={cn(
                            "w-4 h-4",
                            loadingAPK ? "animate-spin" : "",
                          )}
                        />
                      </Button>
                    </TooltipProviderPage>
                  </div>
                </div>
                <DataTable
                  columns={columnListProductColorAPK}
                  data={dataListAPK ?? []}
                  isLoading={loadingAPK}
                />
                <DataTable
                  columns={columnListProductSkuAPK}
                  data={dataListSkuAPK ?? []}
                  isLoading={loadingAPK}
                />
                <Pagination
                  pagination={{ ...metaPageAPK, current: pageAPK }}
                  setPagination={setPageAPK}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
