"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Edit2,
  Hexagon,
  Loader2,
  Package,
  Percent,
  PercentCircle,
  PlusCircle,
  RefreshCw,
  ScanBarcode,
  Search,
  Send,
  Settings,
  Star,
  TicketPercent,
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
import { parseAsInteger, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { useGetListChasier } from "../_api/use-get-list-cashier";
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
import { Badge } from "@/components/ui/badge";
import { useGetListBuyer } from "../_api/use-get-list-buyer";
import dynamic from "next/dynamic";
import { useGetListProduct } from "../_api/use-get-list-product";
import { useUpdatePriceProduct } from "../_api/use-update-price-product";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "motion/react";
import { useGetListPPN } from "../_api/use-get-list-ppn";
import { useCreatePPN } from "../_api/use-create-ppn";
import { useUpdatePPN } from "../_api/use-update-ppn";
import { useDeletePPN } from "../_api/use-delete-ppn";
import { useGetDetailPPN } from "../_api/use-get-detail-ppn";
import { useRouter } from "next/navigation";

const DialogBuyer = dynamic(() => import("./dialog-buyer"), {
  ssr: false,
});
const DialogProduct = dynamic(() => import("./dialog-product"), {
  ssr: false,
});
const DialogUpdatePrice = dynamic(() => import("./dialog-update-price"), {
  ssr: false,
});
const DialogVoucher = dynamic(() => import("./dialog-voucher"), {
  ssr: false,
});
const DialogDiscount = dynamic(() => import("./dialog-discount"), {
  ssr: false,
});
const DialogCarton = dynamic(() => import("./dialog-carton"), {
  ssr: false,
});

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

export const Client = () => {
  const router = useRouter();
  const [isComplete, setIsComplete] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [isOpenCarton, setIsOpenCarton] = useState(false);
  const [isOpenDiscount, setIsOpenDiscount] = useState(false);
  const [isOpenVoucher, setIsOpenVoucher] = useState(false);
  const [isUpdatePrice, setIsUpdatePrice] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [isProduct, setIsProduct] = useState(false);
  const [isOpenPPN, setIsOpenPPN] = useState(false);
  const [isOpenSelectPPN, setIsOpenSelectPPN] = useState(false);
  const [isTax, setIsTax] = useState<boolean | "indeterminate">(false);
  const [dynamicMessage, setDynamicMessage] = useState(
    "This action cannot be undone"
  );
  // const [successMessage, setSuccessMessage] = useState("Sale berhasil dibuat");

  const addRef = useRef<HTMLInputElement | null>(null);
  const [direction, setDirection] = useState(0);

  const [inputPPN, setInputPPN] = useState({
    id: "",
    ppn: "0",
    default: false,
    old_default: false,
  });
  const [input, setInput] = useState({
    discount: "0",
    buyer: "",
    buyerPhone: "",
    buyerAddress: "",
    buyerId: "",
    price: "0",
    cartonQty: "0",
    cartonUnit: "0",
    voucher: "0",
    ppnActive: 0,
    discountFor: "",
    buyerRank: "",
    nextBuyerRank: "",
    nextTransactionBuyerRank: "",
    currentTransactionBuyerRank: "",
    percentage_discount: "0",
    monthlyPoint: "0",
    monthlyClassPosition: "",
  });

  const [inputEdit, setInputEdit] = useState({
    id: "",
    price: "0",
  });

  // search, debounce, paginate strat ----------------------------------------------------------------

  const [addProductSearch, setAddProductSearch] = useState("");
  const searchAddProductValue = useDebounce(addProductSearch);

  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const [buyerSearch, setBuyerSearch] = useState("");
  const searchBuyerValue = useDebounce(buyerSearch);
  const [pageBuyer, setPageBuyer] = useState(1);
  const [metaPageBuyer, setMetaPageBuyer] = useState({
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
    "Create Sale",
    "This action cannot be undone",
    "liquid"
  );

  const [DeleteProductDialog, confirmDeleteProduct] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "destructive"
  );

  const [DeletePPNDialog, confirmDeletePPN] = useConfirm(
    "Delete PPN",
    "This action cannot be undone",
    "destructive"
  );

  const [AddProductDialog, confirmAddProduct] = useConfirm(
    "Confirm Add Product",
    dynamicMessage,
    "liquid"
  );

  // const [SuccessDialog, confirmSuccess] = useConfirm(
  //   "Information",
  //   successMessage,
  //   "liquid"
  // );
  // confirm end ----------------------------------------------------------------

  // mutate strat ----------------------------------------------------------------

  const { mutate: mutateAddProduct, isPending: isPendingAddProduct } =
    useAddProduct();

  const { mutate: mutateRemoveProduct, isPending: isPendingRemoveProduct } =
    useRemoveProduct();

  const { mutate: mutateSubmit, isPending: isPendingSubmit } = useSubmit();
  const { mutate: mutateCreatePPN, isPending: isPendingCreatePPN } =
    useCreatePPN();
  const { mutate: mutateUpdatePPN, isPending: isPendingUpdatePPN } =
    useUpdatePPN();
  const { mutate: mutateDeletePPN, isPending: isPendingDeletePPN } =
    useDeletePPN();

  const { mutate: mutateUpdatePrice, isPending: isPendingUpdatePrice } =
    useUpdatePriceProduct();

  // mutate end ----------------------------------------------------------------

  // query strat ----------------------------------------------------------------

  const { data, refetch, isRefetching, error, isError, isSuccess } =
    useGetListChasier({ p: page });

  const {
    data: dataBuyer,
    refetch: refetchBuyer,
    isRefetching: isRefetchingBuyer,
    error: errorBuyer,
    isError: isErrorBuyer,
    isSuccess: isSuccessBuyer,
  } = useGetListBuyer({ p: pageBuyer, q: searchBuyerValue });

  const {
    data: dataProduct,
    refetch: refetchProduct,
    isRefetching: isRefetchingProduct,
    error: errorProduct,
    isError: isErrorProduct,
    isSuccess: isSuccessProduct,
  } = useGetListProduct({ p: pageProduct, q: searchProductValue });

  const {
    data: dataPPN,
    refetch: refetchPPN,
    isRefetching: isRefetchingPPN,
    error: errorPPN,
    isError: isErrorPPN,
  } = useGetListPPN();
  const {
    data: dataDetailPPN,
    error: errorDetailPPN,
    isError: isErrorDetailPPN,
  } = useGetDetailPPN({ id: inputPPN.id });

  // query end ----------------------------------------------------------------

  // memeo strat ----------------------------------------------------------------

  const dataResPPN: any[] = useMemo(() => {
    return dataPPN?.data.data.resource;
  }, [dataPPN]);

  const dataRes: any = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const dataListBuyer: any[] = useMemo(() => {
    return dataBuyer?.data.data.resource.data;
  }, [dataBuyer]);

  const dataListProduct: any[] = useMemo(() => {
    return dataProduct?.data.data.resource.data;
  }, [dataProduct]);

  // memo end ----------------------------------------------------------------

  const totalPriceBeforeTax =
    parseFloat(dataRes?.total_sale) +
    parseFloat(input.cartonQty) * parseFloat(input.cartonUnit) -
    parseFloat(input.voucher);

  // paginate strat ----------------------------------------------------------------

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccess,
      data: data,
      dataPaginate: data?.data.data.resource,
      setPage: setPage,
      setMetaPage: setMetaPage,
    });
    setInput((prev) => ({
      ...prev,
      buyerAddress: data?.data.data.resource.buyer_address,
      buyerPhone: data?.data.data.resource.buyer_phone,
      buyer: data?.data.data.resource.sale_buyer_name,
      buyerId: data?.data.data.resource.sale_buyer_id,
      discount: Math.round(
        data?.data.data.resource.data?.[0]?.new_discount_sale ?? "0"
      ).toString(),
      discountFor: data?.data.data.resource.data?.[0]?.type_discount ?? "",
      price: Math.round(data?.data.data.resource.total_sale ?? "0").toString(),
      buyerRank: data?.data.data.resource.rank,
      nextBuyerRank: data?.data.data.resource.next_rank,
      nextTransactionBuyerRank: data?.data.data.resource.transaction_next,
      currentTransactionBuyerRank: data?.data.data.resource.current_transaction,
      percentage_discount: Math.round(
        data?.data.data.resource.percentage_discount ?? "0"
      ).toString(),
      monthlyPoint: data?.data.data.resource.monthly_point,
      monthlyClassPosition: data?.data.data.resource.monthly_rank_position,
    }));
  }, [data]);
  useEffect(() => {
    setInput((prev) => ({
      ...prev,
      ppnActive: Math.round(
        dataResPPN?.find((item) => item.is_tax_default === 1)?.ppn ?? "0"
      ),
    }));
  }, [dataResPPN]);

  useEffect(() => {
    setInputPPN((prev) => ({
      ...prev,
      ppn: Math.round(dataDetailPPN?.data.data.resource.ppn).toString() ?? "0",
      default: dataDetailPPN?.data.data.resource.is_tax_default === 1,
      old_default: dataDetailPPN?.data.data.resource.is_tax_default === 1,
    }));
  }, [dataDetailPPN]);

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccessBuyer,
      data: dataBuyer,
      dataPaginate: dataBuyer?.data.data.resource,
      setPage: setPageBuyer,
      setMetaPage: setMetaPageBuyer,
    });
  }, [dataBuyer]);

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

  const handleAddProduct = (barcode: string) => {
    const body = {
      buyer_id: input.buyerId,
      new_discount_sale: input.discount,
      type_discount: input.discountFor,
      sale_barcode: barcode,
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
          if (err?.status === 404) {
            setDynamicMessage("Product tidak ada");
            await confirmAddProduct();
            return;
          }

          const resource = (err?.response?.data?.data as any)?.resource ?? {};
          const barcodeMsg = resource.barcode ?? "-";
          const systemPrice = resource.price_now
            ? `Rp ${formatRupiah(resource.price_now)}`
            : "-";
          const ExpectPrice = resource.expected_price
            ? `Rp ${formatRupiah(resource.expected_price)}`
            : "-";
          const message = `
          ⚠️ UNMATCHED PRICE\n
          Barcode : ${barcodeMsg}
          Harga sistem : ${systemPrice}
          Harga seharusnya : ${ExpectPrice}`;

          setDynamicMessage(message);
          const ok = await confirmAddProduct();
          const desc = document.querySelector("[data-confirm-message]");
          if (desc) desc.textContent = message;
          if (!ok) return;
          mutateAddProduct({ body });
        },
      }
    );
  };

  const handleRemoveProduct = async (id: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    mutateRemoveProduct({ id });
  };

  const handleUpdatePrice = async (price: any) => {
    mutateUpdatePrice(
      { id: inputEdit.id, body: { update_price_sale: price } },
      {
        onSuccess: () => {
          handleCloseUpdatePrice();
        },
      }
    );
  };

  const handleSubmit = async () => {
    setIsComplete(true);

    const ok = await confirmSubmit();

    if (!ok) return;

    const body = {
      cardbox_qty: input.cartonQty,
      cardbox_unit_price: input.cartonUnit,
      total_price_document_sale: totalPriceBeforeTax,
      voucher: input.voucher,
      is_tax: isTax ? 1 : 0,
      tax: input.ppnActive,
      price_after_tax:
        totalPriceBeforeTax +
        (isTax ? (totalPriceBeforeTax / 100) * input.ppnActive : 0),
    };

    mutateSubmit(
      { body },
      {
        onSuccess: async (res: any) => {
          const id = res?.data?.data?.resource?.id;
          // const message = res?.data?.data?.resource?.congratulation_message;
          // setSuccessMessage(`${message || "-"}`);
          // await confirmSuccess();
          router.push(`/outbond/sale/detail/${id}`);
        },
      }
    );
  };

  const handleDeletePPN = async (id: any) => {
    const ok = await confirmDeletePPN();

    if (!ok) return;

    mutateDeletePPN({ id });
  };

  const handleCreatePPN = async () => {
    mutateCreatePPN(
      { body: { ppn: parseFloat(inputPPN.ppn) } },
      {
        onSuccess: () => {
          setDirection(0);
          setInputPPN({
            id: "",
            ppn: "0",
            default: false,
            old_default: false,
          });
        },
      }
    );
  };

  const handleUpdatePPN = async () => {
    mutateUpdatePPN(
      {
        id: inputPPN.id,
        body: {
          ppn: parseFloat(inputPPN.ppn),
          is_tax_default: inputPPN.default ? 1 : 0,
        },
      },
      {
        onSuccess: () => {
          setDirection(0);
          setInputPPN({
            id: "",
            ppn: "0",
            default: false,
            old_default: false,
          });
        },
      }
    );
  };
  const handleUpdateDefaultPPN = async (id: any, ppn: any) => {
    mutateUpdatePPN({ id: id, body: { is_tax_default: 1, ppn } });
  };

  // handling action end ----------------------------------------------------------------

  // handling close strat ----------------------------------------------------------------

  const handleCloseBuyer = () => {
    setIsBuyer(false);
    setBuyerSearch("");
    setPageBuyer(1);
    setMetaPageBuyer({
      from: 0,
      last: 0,
      perPage: 0,
      total: 0,
    });
  };

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

  const handleCloseUpdatePrice = () => {
    setIsUpdatePrice(false);
    setInputEdit({
      id: "",
      price: "0",
    });
  };

  // handling close end ----------------------------------------------------------------

  useEffect(() => {
    if (isNaN(parseFloat(input.discount))) {
      setInput((prev: any) => ({ ...prev, discount: "0", discountFor: "" }));
    }
    if (parseFloat(input.discount) === 0 && input.discountFor) {
      setInput((prev: any) => ({ ...prev, discountFor: "" }));
    }
    if (parseFloat(input.discount) > 0 && !input.discountFor) {
      setInput((prev: any) => ({ ...prev, discountFor: "old" }));
    }
    if (isNaN(input.ppnActive)) {
      setInput((prev) => ({ ...prev, ppnActive: 0 }));
    }
    if (!input.buyerId && isProduct) {
      setIsProduct(false);
    }
  }, [input]);

  useEffect(() => {
    if (isNaN(parseFloat(inputEdit.price))) {
      setInputEdit((prev) => ({ ...prev, price: "0" }));
    }
  }, [inputEdit]);

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

  // handle error buyer
  useEffect(() => {
    alertError({
      isError: isErrorBuyer,
      error: errorBuyer as AxiosError,
      data: "Buyer",
      action: "get data",
      method: "GET",
    });
  }, [isErrorBuyer, errorBuyer]);

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

  // handle error ppn
  useEffect(() => {
    alertError({
      isError: isErrorPPN,
      error: errorPPN as AxiosError,
      data: "PPN",
      action: "get data",
      method: "GET",
    });
  }, [isErrorPPN, errorPPN]);
  // handle error detail ppn
  useEffect(() => {
    alertError({
      isError: isErrorDetailPPN,
      error: errorDetailPPN as AxiosError,
      data: "Detail PPN",
      action: "get data",
      method: "GET",
    });
  }, [isErrorDetailPPN, errorDetailPPN]);

  const columnSales: ColumnDef<any>[] = [
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
      accessorKey: "product_barcode_sale",
      header: "Barcode",
    },
    {
      accessorKey: "product_name_sale",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.product_name_sale}
        </div>
      ),
    },
    {
      accessorKey: "product_category_sale",
      header: "Category",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.product_category_sale}
        </div>
      ),
    },
    {
      accessorKey: "product_qty_sale",
      header: "Qty",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.product_qty_sale}
        </div>
      ),
    },
    {
      accessorKey: "product_price_sale",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.product_price_sale)}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <Button
            className="items-center border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50"
            variant={"outline"}
            disabled={isPendingUpdatePrice || isPendingSubmit}
            type="button"
            onClick={() => {
              setIsUpdatePrice(true);
              setInputEdit({
                id: row.original.id,
                price: row.original.product_price_sale,
              });
            }}
          >
            {isPendingUpdatePrice ? (
              <Loader2 className="w-4 h-4 mr-1" />
            ) : (
              <CircleDollarSign className="w-4 h-4 mr-1" />
            )}
            <div>Update Price</div>
          </Button>
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

  const columnBuyer: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPageBuyer.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "name_buyer",
      header: "Buyer Name",
      cell: ({ row }) => (
        <div className="max-w-[500px]">{row.original.name_buyer}</div>
      ),
    },
    {
      accessorKey: "phone_buyer",
      header: "No. Hp",
    },
    {
      accessorKey: "address_buyer",
      header: "Address",
      cell: ({ row }) => (
        <div className="max-w-[500px]">{row.original.address_buyer}</div>
      ),
    },
    {
      accessorKey: "monthly_point",
      header: "Monthly Point",
      cell: ({ row }) => (
        <div className="max-w-[500px]">{row.original.monthly_point}</div>
      ),
    },
    {
      accessorKey: "monthly_rank_position",
      header: "Montly Rank Position",
      cell: ({ row }) => (
        <div className="max-w-[500px]">
          {row.original.monthly_rank_position}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={"Select"}>
            <Button
              className="items-center border-sky-400 text-black hover:bg-sky-50 p-0 w-9 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={dataList?.length > 0}
              onClick={(e) => {
                e.preventDefault();
                handleCloseBuyer();
                setInput((prev) => ({
                  ...prev,
                  buyer: row.original.name_buyer,
                  buyerId: row.original.id,
                  buyerPhone: row.original.phone_buyer,
                  buyerAddress: row.original.address_buyer,
                  buyerRank: row.original.rank,
                  nextBuyerRank: row.original.next_rank,
                  nextTransactionBuyerRank: row.original.transaction_next,
                  currentTransactionBuyerRank: row.original.current_transaction,
                  monthlyPoint: row.original.monthly_point,
                  monthlyClassPosition: row.original.monthly_rank_position,
                }));
              }}
              type="button"
            >
              <CheckCircle2 className="w-4 h-4" />
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
      accessorKey: "barcode",
      header: "Barcode",
    },
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
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
                handleAddProduct(row.original.barcode);
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
  const columnPPN: ColumnDef<any>[] = [
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
      accessorKey: "ppn",
      header: "PPN",
      cell: ({ row }) => (
        <p className="tabular-nums">{`${Math.round(row.original.ppn)}%`}</p>
      ),
    },
    {
      accessorKey: "is_tax_default",
      header: () => (
        <div className="text-center whitespace-nowrap">Is Default</div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <TooltipProviderPage
            className={cn(
              row.original.is_tax_default === 1 ? "hidden" : "flex"
            )}
            value={"Set Is Default"}
          >
            <Checkbox
              disabled={
                isRefetchingPPN ||
                isPendingUpdatePPN ||
                isPendingCreatePPN ||
                isPendingDeletePPN ||
                row.original.is_tax_default === 1
              }
              className="disabled:opacity-100 disabled:cursor-default"
              onCheckedChange={() =>
                handleUpdateDefaultPPN(
                  row.original.id,
                  Math.round(row.original.ppn)
                )
              }
              checked={row.original.is_tax_default === 1}
            />
          </TooltipProviderPage>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={"Edit PPN"}>
            <Button
              className="items-center border-yellow-400 text-black hover:bg-yellow-50 p-0 w-9 disabled:opacity-100 disabled:hover:bg-yellow-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                setInputPPN((prev) => ({ ...prev, id: row.original.id }));
                setDirection(2);
              }}
              type="button"
            >
              {isPendingAddProduct ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit2 className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={"Delete PPN"}>
            <Button
              className="items-center border-red-400 text-black hover:bg-red-50 p-0 w-9 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                handleDeletePPN(row.original.id);
              }}
              type="button"
            >
              {isPendingAddProduct ? (
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

  const RankIcon = ({ rank }: { rank: string }) => {
    if (!rank) return null;

    const iconSize = 24;

    switch (rank.toLowerCase()) {
      case "bronze":
        return <Hexagon size={iconSize} color="#cd7f32" />; // bronze color
      case "silver":
        return (
          <div className="relative w-6 h-6">
            <Hexagon size={iconSize} color="#c0c0c0" /> {/* Silver Hexagon */}
            <Hexagon
              size={10}
              className="absolute top-[7px] left-[7px] text-[#c0c0c0] fill-current"
            />
          </div>
        );
      case "gold":
        return (
          <div className="relative w-6 h-6">
            <Hexagon size={iconSize} color="#FFD700" /> {/* Gold Hexagon */}
            <Hexagon
              size={16}
              className="absolute top-[4px] left-[4px] text-[#FFD700] fill-current"
            />
          </div>
        );
      case "platinum":
        return (
          <div className="relative w-6 h-6">
            <Hexagon size={iconSize} color="#e5e4e2" />
            <Star
              size={10}
              className="absolute top-[7px] left-[7px] text-[#c0c0c0] fill-current"
            />
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isComplete && isDirty) {
        event.preventDefault();
        event.returnValue = ""; // Beberapa browser memerlukan nilai kosong untuk menampilkan dialog.
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isComplete, isDirty]);

  useEffect(() => {
    if (!inputPPN.id && direction === 2) {
      setDirection(0);
    }
    if (isNaN(parseFloat(inputPPN.ppn))) {
      setInputPPN((prev) => ({ ...prev, ppn: "0" }));
    }
  }, [inputPPN]);

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
      {/* <SuccessDialog /> */}
      <SubmitDialog />
      <DeletePPNDialog />
      <DeleteProductDialog />
      <AddProductDialog />
      <DialogCarton
        open={isOpenCarton}
        onCloseModal={() => {
          if (isOpenCarton) {
            setIsOpenCarton(false);
          }
        }}
        carton={input}
        setCarton={setInput}
        isDirty={isDirty}
        setIsDirty={setIsDirty}
      />
      <DialogDiscount
        open={isOpenDiscount}
        onCloseModal={() => {
          if (isOpenDiscount) {
            setIsOpenDiscount(false);
          }
        }}
        input={input}
        setInput={setInput}
      />
      <DialogVoucher
        open={isOpenVoucher}
        onCloseModal={() => {
          if (isOpenVoucher) {
            setIsOpenVoucher(false);
          }
        }}
        data={dataRes?.total_sale}
        voucher={input.voucher}
        setVoucher={setInput}
        isDirty={isDirty}
        setIsDirty={setIsDirty}
      />
      <DialogBuyer
        open={isBuyer}
        onCloseModal={() => {
          if (isBuyer) {
            handleCloseBuyer();
          }
        }}
        search={buyerSearch}
        setSearch={setBuyerSearch}
        refetch={refetchBuyer}
        isRefetching={isRefetchingBuyer}
        columns={columnBuyer}
        dataTable={dataListBuyer}
        page={pageBuyer}
        metaPage={metaPageBuyer}
        setPage={setPageBuyer}
      />
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
      <DialogUpdatePrice
        open={isUpdatePrice}
        onCloseModal={() => {
          if (isUpdatePrice) {
            handleCloseUpdatePrice();
          }
        }}
        data={inputEdit.price}
        handleSubmit={handleUpdatePrice}
      />
      <Sheet open={isOpenPPN} onOpenChange={setIsOpenPPN}>
        <SheetContent className="min-w-[50vw] overflow-x-hidden">
          <SheetHeader>
            <SheetTitle>
              {direction === 0 ? "List" : direction === 1 ? "Create" : "Edit"}{" "}
              PPN
            </SheetTitle>
          </SheetHeader>
          <div className="w-full h-full mt-10">
            <AnimatePresence mode="wait" custom={direction}>
              {direction === 0 && (
                <motion.div
                  key={direction}
                  custom={direction}
                  variants={variants}
                  initial={variants.enter(direction)}
                  animate="center"
                  exit={variants.enter(direction)}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col w-full gap-3"
                >
                  <div className="flex items-center justify-start gap-3">
                    <Button onClick={() => setDirection(1)} variant={"liquid"}>
                      <PlusCircle />
                      Create
                    </Button>
                    <Button
                      onClick={() => refetchPPN()}
                      variant={"outline"}
                      size={"icon"}
                      className="border-sky-400/80 hover:border-sky-400 hover:bg-sky-50"
                    >
                      <RefreshCw
                        className={cn(isRefetching && "animate-spin")}
                      />
                    </Button>
                  </div>
                  <DataTable
                    columns={columnPPN}
                    data={dataResPPN ?? []}
                    isLoading={isRefetching}
                    isSticky
                  />
                </motion.div>
              )}
              {(direction === 1 || direction === 2) && (
                <motion.div
                  key={direction}
                  custom={direction}
                  variants={variants}
                  initial={variants.enter(direction)}
                  animate="center"
                  exit={variants.enter(direction)}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col w-full gap-3"
                >
                  <div className="flex items-center w-full">
                    <Button
                      className="hover:bg-transparent hover:mr-3 transition-all peer"
                      variant={"ghost"}
                      size={"icon"}
                      onClick={() => {
                        setDirection(0);
                        setInputPPN({
                          id: "",
                          ppn: "0",
                          default: false,
                          old_default: false,
                        });
                      }}
                    >
                      <ArrowLeft />
                    </Button>
                    <p className="peer-hover:underline peer-hover:underline-offset-2 transition-all font-semibold">
                      Back
                    </p>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (direction === 1) {
                        handleCreatePPN();
                      } else {
                        handleUpdatePPN();
                      }
                    }}
                    className="w-full p-3 border border-sky-400/80 rounded-md flex flex-col gap-3"
                  >
                    <div className="flex flex-col gap-1.5">
                      <Label>PPN</Label>
                      <div className="flex items-center relative">
                        <Input
                          value={inputPPN.ppn}
                          type="number"
                          onChange={(e) =>
                            setInputPPN((prev) => ({
                              ...prev,
                              ppn: e.target.value.startsWith("0")
                                ? e.target.value.replace(/^0+/, "")
                                : e.target.value,
                            }))
                          }
                          disabled={
                            isRefetchingPPN ||
                            isPendingUpdatePPN ||
                            isPendingCreatePPN
                          }
                          className="rounded focus-visible:ring-0 focus-visible:border focus-visible:border-sky-300 border-sky-300/80 disabled:opacity-100"
                        />
                        <Percent className="size-4 absolute right-3" />
                      </div>
                    </div>
                    {direction === 2 && (
                      <Label className="flex gap-2 items-center my-2">
                        <Checkbox
                          disabled={
                            isRefetchingPPN ||
                            isPendingUpdatePPN ||
                            isPendingCreatePPN ||
                            inputPPN.old_default
                          }
                          className="disabled:opacity-100 disabled:cursor-default size-4"
                          onCheckedChange={() =>
                            setInputPPN((prev) => ({
                              ...prev,
                              default: !prev.default,
                            }))
                          }
                          checked={inputPPN.default}
                        />
                        Is Default
                      </Label>
                    )}
                    <div className="">
                      <Button
                        className={cn(
                          direction === 1
                            ? "bg-sky-400/80 text-black shadow hover:bg-sky-400"
                            : "bg-yellow-400/80 text-black shadow hover:bg-yellow-400"
                        )}
                        type="submit"
                        disabled={
                          isRefetchingPPN ||
                          isPendingUpdatePPN ||
                          isPendingCreatePPN
                        }
                      >
                        {direction === 1 ? "Create" : "Update"}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex flex-col gap-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Outbond</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/outbond/sale">Sale</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Cashier</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
          <Link href="/outbond/sale">
            <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Cashier</h1>
        </div>
        <div className="w-full flex gap-2 items-center bg-yellow-300 rounded border border-yellow-500 text-sm p-3">
          <AlertCircle className="size-4 flex-none" />
          <p>
            The discount is applied before any products are on sale. If you want
            to change the discount, please clear the sale products first.
          </p>
        </div>
        <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
          <div className="flex items-center justify-between pb-3 mb-5 border-gray-500 border-b w-full">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                <ScanBarcode className="size-4" />
              </div>
              <h5 className="font-bold text-xl">
                {dataRes?.code_document_sale}
              </h5>
            </div>
            <div className="flex items-center gap-2">
              {!dataRes?.sale_buyer_name && (
                <Button
                  type="button"
                  onClick={() => setIsBuyer(true)}
                  className="bg-sky-400/80 hover:bg-sky-400 text-black"
                >
                  <BriefcaseBusiness className="size-4 mr-1" />
                  Buyer
                </Button>
              )}
              {metaPage.total === 0 && (
                <Button
                  type={"button"}
                  onClick={() => setIsOpenDiscount(true)}
                  className="bg-yellow-400/80 hover:bg-yellow-400 text-black"
                >
                  <PercentCircle className="size-4 mr-1" />
                  Discount
                </Button>
              )}
              <Button
                type={"button"}
                onClick={() => setIsOpenVoucher(true)}
                className="bg-violet-400/80 hover:bg-violet-400 text-black"
              >
                <TicketPercent className="size-4 mr-1" />
                Voucher
              </Button>
            </div>
          </div>
          <div className="flex w-full gap-4">
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-sm">Buyer</p>
                <p className="font-semibold">
                  {input.buyer ? input.buyer : "-"}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Buyer Phone</p>
                <p className="font-semibold">
                  {input.buyerPhone ? input.buyerPhone : "-"}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Buyer Address</p>
                <p className="font-semibold">
                  {input.buyerAddress ? input.buyerAddress : "-"}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Buyer Class</p>
                <div className="flex items-center gap-2 font-semibold">
                  <RankIcon rank={input.buyerRank ? input.buyerRank : "-"} />
                  <p>{input.buyerRank ? input.buyerRank : "-"}</p>
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Next Buyer Class</p>
                <div className="flex items-center gap-2 font-semibold">
                  <RankIcon
                    rank={input.nextBuyerRank ? input.nextBuyerRank : "-"}
                  />
                  <p>{input.nextBuyerRank ? input.nextBuyerRank : "-"}</p>
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Montly Point</p>
                <div className="flex items-center gap-2 font-semibold">
                  <p>{input.monthlyPoint ? input.monthlyPoint : "0"}</p>
                </div>
              </div>
              {/* <div className="flex flex-col">
                <p className="text-sm">Discount Class</p>
                <p className="font-semibold">{input.percentage_discount}%</p>
              </div> */}
            </div>
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-sm">Current Transaction</p>
                <p className="font-semibold">
                  {input.currentTransactionBuyerRank
                    ? input.currentTransactionBuyerRank
                    : "-"}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Next Transaction to Upgrade Class</p>
                <p className="font-semibold">
                  {input.nextTransactionBuyerRank
                    ? input.nextTransactionBuyerRank
                    : "-"}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Total Product</p>
                <p className="font-semibold">
                  {metaPage.total.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center">
                <div className="flex flex-col w-full">
                  <p className="text-sm">Total Diskon</p>
                  <p className="font-semibold">{input.discount}%</p>
                </div>
                {input.discountFor && (
                  <div className="flex flex-col w-full">
                    <p className="text-sm">Diskon for</p>
                    <p className="font-semibold">
                      {input.discountFor === "old" ? "Old Price" : "New Price"}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Total Voucher</p>
                <p className="font-semibold">
                  {formatRupiah(parseFloat(input.voucher ?? "0"))}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Montly Rank Position</p>
                <div className="flex items-center gap-2 font-semibold">
                  <p>
                    {input.monthlyClassPosition
                      ? input.monthlyClassPosition
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-500 w-full pt-3 mt-5">
            <div className="flex flex-row items-center gap-x-4">
              <div className="flex flex-col">
                <p className="text-sm">Total Product Price</p>
                <p className="font-semibold">
                  {formatRupiah(dataRes?.total_sale)}
                </p>
              </div>
              {/* <div className="text-lg font-bold">→</div>
              <div className="flex flex-col">
                <p className="text-sm">After Rank Discount</p>
                <p className="font-semibold">
                  {formatRupiah(
                    Math.round(
                      parseFloat(dataRes?.total_sale ?? "0") -
                        (parseFloat(dataRes?.total_sale ?? "0") *
                          parseFloat(input.percentage_discount ?? "0")) /
                          100
                    )
                  )}
                </p>
              </div> */}
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
          <div className="flex items-center justify-between pb-3 mb-5 border-gray-500 border-b w-full">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                <Package className="size-4" />
              </div>
              <h5 className="font-bold text-xl">Carton Box</h5>
            </div>
            <TooltipProviderPage value={"Edit Carton Box"} align="end">
              <Button
                type={"button"}
                onClick={() => setIsOpenCarton(true)}
                className="items-center w-9 px-0 flex-none h-9 bg-yellow-400/80 text-black hover:bg-yellow-400"
              >
                <ArrowLeftRight className="size-4" />
              </Button>
            </TooltipProviderPage>
          </div>
          <div className="flex w-full gap-4">
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-sm">Qty</p>
                <p className="font-semibold">{input.cartonQty}</p>
              </div>
            </div>
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-sm">Per Unit</p>
                <p className="font-semibold">
                  {formatRupiah(parseFloat(input.cartonUnit))}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-500 w-full pt-3 mt-5">
            <div className="flex flex-col">
              <p className="text-sm">Total Carton Box Price</p>
              <p className="font-semibold">
                {formatRupiah(
                  parseFloat(input.cartonQty) * parseFloat(input.cartonUnit)
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
          <div className="flex items-center">
            <Label className="flex items-center gap-2 text-sm">
              <Checkbox
                onCheckedChange={setIsTax}
                className="size-4"
                disabled={parseFloat(dataRes?.total_sale) < 1000000} // Disable if grand total < 1 million
              />
              With PPN
            </Label>
            <div
              className={cn(
                "ml-5 pl-5 border-l h-full border-gray-500 font-semibold",
                !isTax && "line-through"
              )}
            >
              {formatRupiah((totalPriceBeforeTax / 100) * input.ppnActive)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!input.ppnActive && (
              <div className="px-5 py-1 text-sm border border-red-400 rounded bg-red-50 text-red-500 flex items-center gap-2">
                <AlertCircle className="size-4" />
                <p>Set Percentence PPN</p>
              </div>
            )}
            <Popover onOpenChange={setIsOpenSelectPPN} open={isOpenSelectPPN}>
              <PopoverTrigger asChild>
                <Button
                  className="justify-between w-24 hover:bg-sky-100"
                  variant={"ghost"}
                >
                  {input.ppnActive}%
                  <ChevronDown />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0"
                style={{ width: "var(--radix-popover-trigger-width)" }}
              >
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {dataResPPN &&
                        dataResPPN.length > 0 &&
                        dataResPPN.map((item) => (
                          <CommandItem
                            key={item.id}
                            onSelect={() => {
                              setInput((prev) => ({
                                ...prev,
                                ppnActive: Math.round(item.ppn),
                              }));
                              setIsOpenSelectPPN(false);
                            }}
                          >
                            {Math.round(item.ppn)}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              onClick={() => setIsOpenPPN(true)}
              variant={"liquid"}
              size={"icon"}
            >
              <Settings />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between w-full bg-sky-300/80 rounded-md overflow-hidden shadow p-5">
          <div className="flex items-center gap-4 text-lg">
            <div className="h-full pr-4 border-r border-black flex items-center whitespace-nowrap">
              <p className="font-semibold">Grand Total</p>
            </div>
            <p className="font-semibold w-full text-center">
              {formatRupiah(
                parseFloat(dataRes?.total_sale) +
                  parseFloat(input.cartonQty) * parseFloat(input.cartonUnit) -
                  parseFloat(input.voucher) +
                  (isTax ? (totalPriceBeforeTax / 100) * input.ppnActive : 0)
              )}
              {/* {formatRupiah(
                Math.round(
                  parseFloat(dataRes?.total_sale ?? "0") -
                    (parseFloat(dataRes?.total_sale ?? "0") *
                      parseFloat(input.percentage_discount ?? "0")) /
                      100 +
                    parseFloat(input.cartonQty) * parseFloat(input.cartonUnit) -
                    parseFloat(input.voucher) +
                    (isTax
                      ? ((parseFloat(dataRes?.total_sale ?? "0") -
                          (parseFloat(dataRes?.total_sale ?? "0") *
                            parseFloat(input.percentage_discount ?? "0")) /
                            100 +
                          parseFloat(input.cartonQty) *
                            parseFloat(input.cartonUnit) -
                          parseFloat(input.voucher)) /
                          100) *
                        input.ppnActive
                      : 0)
                )
              )} */}
            </p>
          </div>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            disabled={
              dataList?.length === 0 || isPendingSubmit || !input.ppnActive
            }
            className="bg-white/80 hover:bg-white text-black"
          >
            <Send className="size-4 mr-1" />
            Sale
          </Button>
        </div>
        <div className="flex w-full gap-4">
          <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5">
            <div
              className={cn(
                "w-full flex justify-between items-center relative group",
                !input.buyer && "cursor-not-allowed"
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
              <TooltipProviderPage
                className={cn(!input.buyer ? "opacity-100" : "opacity-0")}
                value={<p>Select Buyer First.</p>}
              >
                <Input
                  id="search"
                  ref={addRef}
                  className="rounded-r-none border-r-0 pl-28 focus-visible:ring-0 focus-visible:border focus-visible:border-sky-300 border-sky-300/80 disabled:opacity-100"
                  autoFocus
                  autoComplete="off"
                  disabled={!input.buyer || isPendingSubmit}
                  value={addProductSearch}
                  onChange={(e) => setAddProductSearch(e.target.value)}
                />
              </TooltipProviderPage>
              <Button
                disabled={!input.buyer || isPendingSubmit}
                onClick={() => setIsProduct(true)}
                className="bg-sky-300/80 w-10 p-0 hover:bg-sky-300 text-black rounded-l-none border border-sky-300/80 hover:border-sky-300 focus-visible:ring-0 disabled:opacity-100"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-none bg-white rounded-md overflow-hidden shadow p-5">
            <TooltipProviderPage value={"Reload Data"}>
              <Button
                onClick={() => refetch()}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant={"outline"}
                disabled={isPendingSubmit || isRefetching}
              >
                <RefreshCw
                  className={cn("w-4 h-4", isRefetching ? "animate-spin" : "")}
                />
              </Button>
            </TooltipProviderPage>
          </div>
        </div>
        <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
          <DataTable
            isLoading={isRefetching}
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
