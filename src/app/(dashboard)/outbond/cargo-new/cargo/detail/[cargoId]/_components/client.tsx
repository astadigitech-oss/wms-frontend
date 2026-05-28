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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirm } from "@/hooks/use-confirm";
import { usePagination } from "@/lib/pagination";
import { useSearchQuery } from "@/lib/search";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { ColumnDef } from "@tanstack/react-table";
import { AxiosError } from "axios";
import {
  CheckCircle2,
  FileDown,
  Loader2,
  Package,
  Printer,
  ReceiptText,
  Ruler,
  RefreshCw,
  ScanText,
  Search,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  useAddBagCargo,
  useExportDetailDataCargo,
  useGetDetailCargo,
  useGetInfoCargo,
  useGetListBuyer,
  useRemoveBagCargo,
  useSetSaleCargo,
  useSetStatusCargo,
  useSetWeightCargo,
} from "../_api";

const DialogBarcode = dynamic(() => import("./dialog-barcode"), {
  ssr: false,
});
const DialogDetail = dynamic(() => import("./dialog-detail"), {
  ssr: false,
});

const getCargoTotalBag = (cargo: any | undefined, bags: any[]) =>
  cargo?.total_bag ?? bags.length ?? 0;

const normalizeValue = (value?: string | number) =>
  value === undefined || value === null ? "" : String(value);

const normalizeStatus = (status?: string) => status?.toLowerCase() ?? "";

const normalizeSaleStatus = (status?: string) => status?.toLowerCase() ?? "";

const parseNumberValue = (value?: string | number) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buyerColumns = ({
  metaPage,
  onSelect,
}: {
  metaPage: any;
  onSelect: (buyer: any) => void;
}): ColumnDef<any>[] => [
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
    accessorKey: "name_buyer",
    header: "Buyer Name",
    cell: ({ row }) => (
      <div className="max-w-[420px] break-all">
        {row.original.name_buyer ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "phone_buyer",
    header: "No. Hp",
    cell: ({ row }) => row.original.phone_buyer ?? "-",
  },
  {
    id: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <TooltipProviderPage value="Select Buyer">
          <Button
            type="button"
            variant="outline"
            className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50"
            onClick={(e) => {
              e.preventDefault();
              onSelect(row.original);
            }}
          >
            <CheckCircle2 className="size-4" />
          </Button>
        </TooltipProviderPage>
      </div>
    ),
  },
];

const DialogBuyer = ({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: () => void;
  onSelect: (buyer: any) => void;
}) => {
  const { search, searchValue, setSearch } = useSearchQuery("searchBuyerCargo");
  const { metaPage, page, setPage, setPagination } =
    usePagination("pageBuyerCargo");

  const { data, isPending, refetch, isRefetching, isSuccess, error, isError } =
    useGetListBuyer({
      p: page,
      q: searchValue,
      enabled: open,
    });

  const buyers: any = useMemo(() => {
    return data?.data?.data?.resource?.data ?? [];
  }, [data]);
  const isLoading = isPending || isRefetching;

  useEffect(() => {
    if (isSuccess && data?.data?.data?.resource) {
      setPagination(data.data.data.resource);
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
    if (!open) {
      setPage(1);
      setSearch("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onClose={false}
        className="max-w-6xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Select Buyer
            <TooltipProviderPage value="Close" side="left">
              <button
                type="button"
                onClick={onOpenChange}
                className="flex size-7 items-center justify-center rounded-full border border-black hover:bg-gray-100"
              >
                <X className="size-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full">
            <div className="relative w-full md:w-2/5">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-9 border-sky-400/80 focus-visible:ring-sky-400"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search buyer..."
                autoFocus
              />
            </div>
            <TooltipProviderPage value="Reload Data">
              <Button
                onClick={() => refetch()}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant="outline"
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn("w-4 h-4", isLoading ? "animate-spin" : "")}
                />
              </Button>
            </TooltipProviderPage>
          </div>
          <DataTable
            isSticky
            maxHeight="h-[60vh]"
            isLoading={isLoading}
            columns={buyerColumns({
              metaPage,
              onSelect,
            })}
            data={buyers}
          />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const Client = () => {
  const { cargoId } = useParams();
  const scanRef = useRef<HTMLInputElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [openWeight, setOpenWeight] = useState(false);
  const [openSale, setOpenSale] = useState(false);
  const [openBuyer, setOpenBuyer] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [idBagCargo, setIdBagCargo] = useState("");
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [selectedBarcodeBag, setSelectedBarcodeBag] = useState("");
  const [selectedTotalProductBag, setSelectedTotalProductBag] = useState("");
  const [selectedNameBag, setSelectedNameBag] = useState("");
  const [scanValue, setScanValue] = useState("");
  const [searchBag, setSearchBag] = useState("");
  const [weightInput, setWeightInput] = useState({
    length: "",
    width: "",
    height: "",
    weight: "",
  });
  const [saleInput, setSaleInput] = useState({
    buyer_id: "",
    name_buyer: "",
    discount_bulky: "0",
  });
  const { metaPage, page, setPage, setPagination } =
    usePagination("pageCargoBag");

  const [RemoveBagDialog, confirmRemoveBag] = useConfirm(
    "Remove Bag Cargo",
    "This action cannot be undone.",
    "destructive",
  );
  const [StatusDialog, confirmStatus] = useConfirm(
    "Set Status Cargo",
    "This action cannot be undone.",
    "liquid",
  );

  const { data, refetch, isPending, isRefetching, isSuccess, error, isError } =
    useGetDetailCargo({
      id: cargoId,
      p: page,
      q: searchBag,
    });
  const {
    data: dataInfo,
    refetch: refetchInfo,
    isPending: isPendingInfo,
    isRefetching: isRefetchingInfo,
    error: errorInfo,
    isError: isErrorInfo,
  } = useGetInfoCargo({
    id: cargoId,
  });

  const { mutate: addBag, isPending: isPendingAddBag } = useAddBagCargo();
  const { mutate: removeBag, isPending: isPendingRemoveBag } =
    useRemoveBagCargo();
  const { mutate: setWeightCargo, isPending: isPendingSetWeight } =
    useSetWeightCargo();
  const { mutate: setStatusCargo, isPending: isPendingSetStatus } =
    useSetStatusCargo();
  const { mutate: setSaleCargo, isPending: isPendingSetSale } =
    useSetSaleCargo();
  const { mutate: exportDetailCargo, isPending: isPendingExport } =
    useExportDetailDataCargo();

  const dataResource = data?.data?.data?.resource;
  const dataInfoResource = dataInfo?.data?.data?.resource;
  const cargo: any = useMemo(() => {
    return (
      dataInfoResource?.cargo ??
      dataInfoResource?.cargo_info ??
      dataInfoResource?.data ??
      dataInfoResource ??
      dataResource ??
      {}
    );
  }, [dataInfoResource, dataResource]);
  const bags: any = useMemo(() => {
    return dataResource?.data ?? [];
  }, [dataResource]);

  const loading = isPending || isRefetching;
  const infoLoading = isPendingInfo || isRefetchingInfo;
  const statusCargo = normalizeStatus(cargo?.status_bulky);
  const saleStatus = normalizeSaleStatus(cargo?.is_sale);
  const isCargoDone = statusCargo === "selesai" || statusCargo === "done";
  const isCargoProcess = statusCargo === "proses" || statusCargo === "process";
  const canSetCargoSale = saleStatus === "not sale" || saleStatus === "ready";
  const isCargoOnline = cargo?.type?.toLowerCase() === "cargo online";
  const nextStatus = isCargoDone ? "proses" : "selesai";
  const cargoPrice =
    cargo?.total_old_price ?? cargo?.total_old_price_bulky ?? 0;
  const saleDiscount = isCargoOnline
    ? 0
    : parseNumberValue(saleInput.discount_bulky);
  const totalAfterDiscount = Math.max(
    cargoPrice - (saleDiscount / 100) * cargoPrice,
    0,
  );

  const refetchAll = () => {
    refetch();
    refetchInfo();
  };

  const handleScanSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const barcodeBag = scanValue.trim();
    if (!barcodeBag || isPendingAddBag) return;

    addBag(
      {
        cargoId: cargoId,
        body: {
          barcode_bag: barcodeBag,
        },
      },
      {
        onSuccess: () => {
          setScanValue("");
          refetchAll();
          scanRef.current?.focus();
        },
      },
    );
  };

  const handleRemoveBag = async (bagId: string) => {
    const ok = await confirmRemoveBag();
    if (!ok) return;

    removeBag(
      {
        cargoId: cargoId,
        body: {
          bag_product_id: bagId,
        },
      },
      {
        onSuccess: () => {
          refetchAll();
        },
      },
    );
  };

  const handleWeightSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setWeightCargo(
      {
        id: cargoId,
        body: weightInput,
      },
      {
        onSuccess: () => {
          setOpenWeight(false);
          refetchAll();
        },
      },
    );
  };

  const handleSetStatus = async () => {
    const ok = await confirmStatus();
    if (!ok) return;

    setStatusCargo(
      {
        id: cargoId,
      },
      {
        onSuccess: () => {
          refetchAll();
        },
      },
    );
  };

  const handleSaleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSaleCargo(
      {
        id: cargoId,
        body: {
          buyer_id: isCargoOnline ? "" : saleInput.buyer_id,
          discount_bulky: isCargoOnline ? "0" : saleInput.discount_bulky,
        },
      },
      {
        onSuccess: () => {
          setOpenSale(false);
          refetchAll();
        },
      },
    );
  };

  const handleExport = () => {
    exportDetailCargo(
      { id: cargoId },
      {
        onSuccess: (res) => {
          const link = document.createElement("a");
          link.href = res.data.data.resource;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
      },
    );
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleOpenWeight = () => {
    setWeightInput({
      length: normalizeValue(cargo?.length),
      width: normalizeValue(cargo?.width),
      height: normalizeValue(cargo?.height),
      weight: normalizeValue(cargo?.weight),
    });
    setOpenWeight(true);
  };

  const handleOpenSale = () => {
    setSaleInput({
      buyer_id: normalizeValue(cargo?.buyer_id),
      name_buyer: cargo?.name_buyer ?? "",
      discount_bulky: normalizeValue(cargo?.discount_bulky) || "0",
    });
    setOpenSale(true);
  };

  const handleCloseSale = (open: boolean) => {
    setOpenSale(open);
    if (!open) {
      setOpenBuyer(false);
    }
  };

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data Detail Cargo",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  useEffect(() => {
    alertError({
      isError: isErrorInfo,
      error: errorInfo as AxiosError,
      data: "Info Detail Cargo",
      action: "get data",
      method: "GET",
    });
  }, [isErrorInfo, errorInfo]);

  useEffect(() => {
    if (isSuccess && dataResource) {
      setPagination(dataResource);
    }
  }, [dataResource, isSuccess]);

  const columnBag: ColumnDef<any>[] = [
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
      accessorKey: "barcode_bag",
      header: "Barcode Bag",
      cell: ({ row }) => (
        <div className="max-w-[280px] break-all">
          {row.original.barcode_bag ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "name_bag",
      header: "Name Bag",
      cell: ({ row }) => (
        <div className="max-w-[420px] break-all">
          {row.original.name_bag ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "total_product",
      header: () => <div className="text-center">Total Item</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(row.original.total_product ?? 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: () => <div className="text-center">Harga Asal</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {formatRupiah(row.original.price ?? 0)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded min-w-20 justify-center text-black font-normal capitalize",
              row.original.status === "done" &&
                "bg-green-400 hover:bg-green-400",
              row.original.status === "process" &&
                "bg-yellow-400 hover:bg-yellow-400",
            )}
          >
            {row.original.status ?? "-"}
          </Badge>
        </div>
      ),
    },
    {
      id: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <TooltipProviderPage value="Detail Bag">
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                setIdBagCargo(row.original.id);
                setOpenDetail(true);
              }}
            >
              <ReceiptText className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value="Print Barcode">
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                setSelectedBarcodeBag(row.original.barcode_bag ?? "");
                setSelectedTotalProductBag(
                  normalizeValue(row.original.total_product),
                );
                setSelectedNameBag(row.original.name_bag ?? "");
                setBarcodeOpen(true);
              }}
            >
              <Printer className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value="Remove Bag">
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant="outline"
              disabled={isPendingRemoveBag}
              onClick={(e) => {
                e.preventDefault();
                handleRemoveBag(row.original.id);
              }}
            >
              {isPendingRemoveBag ? (
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

  if (!isMounted) {
    return <Loading />;
  }

  if (
    (isError && (error as AxiosError)?.status === 403) ||
    (isErrorInfo && (errorInfo as AxiosError)?.status === 403)
  ) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <RemoveBagDialog />
      <StatusDialog />
      <DialogDetail
        open={openDetail}
        onCloseModal={() => {
          if (openDetail) {
            setOpenDetail(false);
            setIdBagCargo("");
          }
        }}
        idBagCargo={idBagCargo}
      />
      <DialogBarcode
        onCloseModal={() => {
          if (barcodeOpen) {
            setBarcodeOpen(false);
          }
        }}
        open={barcodeOpen}
        barcode={selectedBarcodeBag}
        qty={selectedTotalProductBag}
        name={selectedNameBag}
        handleCancel={() => {
          setBarcodeOpen(false);
        }}
      />
      <DialogBuyer
        open={openBuyer}
        onOpenChange={() => setOpenBuyer(false)}
        onSelect={(buyer) => {
          setSaleInput((prev) => ({
            ...prev,
            buyer_id: String(buyer.id),
            name_buyer: buyer.name_buyer ?? "",
          }));
          setOpenBuyer(false);
        }}
      />
      <Dialog open={openWeight} onOpenChange={setOpenWeight}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Weight Cargo</DialogTitle>
            <DialogDescription>
              Isi ukuran cargo dan berat aktual.
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleWeightSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="cargo-length">Panjang (cm)</Label>
                <Input
                  id="cargo-length"
                  type="number"
                  min="0"
                  step="0.01"
                  value={weightInput.length}
                  onChange={(e) =>
                    setWeightInput((prev) => ({
                      ...prev,
                      length: e.target.value,
                    }))
                  }
                  className="border-sky-400/80 focus-visible:ring-sky-400"
                  disabled={isPendingSetWeight}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cargo-width">Lebar (cm)</Label>
                <Input
                  id="cargo-width"
                  type="number"
                  min="0"
                  step="0.01"
                  value={weightInput.width}
                  onChange={(e) =>
                    setWeightInput((prev) => ({
                      ...prev,
                      width: e.target.value,
                    }))
                  }
                  className="border-sky-400/80 focus-visible:ring-sky-400"
                  disabled={isPendingSetWeight}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cargo-height">Tinggi (cm)</Label>
                <Input
                  id="cargo-height"
                  type="number"
                  min="0"
                  step="0.01"
                  value={weightInput.height}
                  onChange={(e) =>
                    setWeightInput((prev) => ({
                      ...prev,
                      height: e.target.value,
                    }))
                  }
                  className="border-sky-400/80 focus-visible:ring-sky-400"
                  disabled={isPendingSetWeight}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cargo-weight">Berat (kg)</Label>
                <Input
                  id="cargo-weight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={weightInput.weight}
                  onChange={(e) =>
                    setWeightInput((prev) => ({
                      ...prev,
                      weight: e.target.value,
                    }))
                  }
                  className="border-sky-400/80 focus-visible:ring-sky-400"
                  disabled={isPendingSetWeight}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenWeight(false)}
                disabled={isPendingSetWeight}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="liquid"
                disabled={isPendingSetWeight}
              >
                {isPendingSetWeight ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Ruler className="size-4" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={openSale} onOpenChange={handleCloseSale}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Penjualan</DialogTitle>
            <DialogDescription>
              {isCargoOnline
                ? "Set penjualan untuk cargo online."
                : "Pilih buyer dan isi diskon untuk penjualan cargo."}
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSaleSubmit}>
            {!isCargoOnline && (
              <div className="flex flex-col gap-2">
                <Label>Buyer</Label>
                <div className="flex gap-2">
                  <Input
                    value={saleInput.name_buyer || saleInput.buyer_id}
                    placeholder="Select buyer"
                    className="border-sky-400/80 bg-gray-50 focus-visible:ring-sky-400"
                    disabled
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-sky-400 text-sky-700 hover:bg-sky-50 hover:text-sky-700"
                    onClick={() => setOpenBuyer(true)}
                    disabled={isPendingSetSale}
                  >
                    Select
                  </Button>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="cargo-sale-price">Price</Label>
              <Input
                id="cargo-sale-price"
                value={formatRupiah(cargoPrice)}
                className="border-sky-400/80 bg-gray-50 focus-visible:ring-sky-400"
                disabled
              />
            </div>
            {!isCargoOnline && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="cargo-discount">Diskon (%)</Label>
                <Input
                  id="cargo-discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={saleInput.discount_bulky}
                  onChange={(e) =>
                    setSaleInput((prev) => ({
                      ...prev,
                      discount_bulky: e.target.value,
                    }))
                  }
                  className="border-sky-400/80 focus-visible:ring-sky-400"
                  disabled={isPendingSetSale}
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="cargo-total-after-discount">
                Total After Discount
              </Label>
              <Input
                id="cargo-total-after-discount"
                value={formatRupiah(totalAfterDiscount)}
                className="border-emerald-400/80 bg-emerald-50 font-semibold text-emerald-700 focus-visible:ring-emerald-400"
                disabled
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenSale(false)}
                disabled={isPendingSetSale}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="liquid"
                disabled={
                  (!isCargoOnline && !saleInput.buyer_id.trim()) ||
                  isPendingSetSale
                }
              >
                {isPendingSetSale ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShoppingCart className="size-4" />
                )}
                Jual
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/outbond/cargo-new/cargo">
              Cargo
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Detail</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="w-full rounded-md border border-sky-400/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 pb-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Detail Cargo {cargo?.code_document_bulky}
            </h2>
            <p className="mt-1 break-all text-sm text-gray-500">
              {cargo?.name_document ?? cargo?.code_document_bulky ?? "-"}
            </p>
          </div>
          <div className="flex flex-none items-center gap-2">
            <TooltipProviderPage value="Export Data">
              <Button
                onClick={handleExport}
                className="items-center h-9 border-emerald-400 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700"
                variant="outline"
                disabled={isPendingExport}
              >
                {isPendingExport ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                Export Data
              </Button>
            </TooltipProviderPage>
            <TooltipProviderPage value="Reload Data">
              <Button
                onClick={() => {
                  refetchAll();
                }}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant="outline"
              >
                <RefreshCw
                  className={cn(
                    "w-4 h-4",
                    loading || infoLoading ? "animate-spin" : "",
                  )}
                />
              </Button>
            </TooltipProviderPage>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
          {canSetCargoSale && (
            <Button
              type="button"
              variant="outline"
              className="border-sky-400 text-sky-700 hover:bg-sky-50 hover:text-sky-700"
              onClick={handleOpenWeight}
            >
              <Ruler className="size-4" />
              Set Weight
            </Button>
          )}
          {canSetCargoSale && (isCargoProcess || isCargoDone) && (
            <Button
              type="button"
              variant="outline"
              className="border-amber-400 text-amber-700 hover:bg-amber-50 hover:text-amber-700"
              onClick={handleSetStatus}
              disabled={isPendingSetStatus}
            >
              {isPendingSetStatus ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ScanText className="size-4" />
              )}
              Set Status {nextStatus}
            </Button>
          )}
          {canSetCargoSale && (
            <Button
              type="button"
              variant="outline"
              className="border-emerald-400 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={handleOpenSale}
            >
              <ShoppingCart className="size-4" />
              Jual
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Item</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">
                  {(
                    cargo?.total_product ??
                    cargo?.total_product_bulky ??
                    0
                  ).toLocaleString()}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                <Package className="size-5" />
              </div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Harga Asal</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">
                  {formatRupiah(
                    cargo?.total_old_price ?? cargo?.total_old_price_bulky ?? 0,
                  )}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                <WalletCards className="size-5" />
              </div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bag</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">
                  {getCargoTotalBag(cargo, bags).toLocaleString()}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-violet-100 text-violet-700">
                <ShoppingBag className="size-5" />
              </div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-2">
                  <Badge
                    className={cn(
                      "rounded min-w-24 justify-center text-black font-normal capitalize",
                      cargo?.status_bulky === "selesai" &&
                        "bg-green-400 hover:bg-green-400",
                      (cargo?.status_bulky === "proses" ||
                        cargo?.status_bulky === "proses") &&
                        "bg-yellow-400 hover:bg-yellow-400",
                    )}
                  >
                    {cargo?.status_bulky ?? "-"}
                  </Badge>
                </div>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                <ScanText className="size-5" />
              </div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Status Sale
                </p>
                <div className="mt-2">
                  <Badge
                    className={cn(
                      "rounded min-w-24 justify-center text-black font-normal capitalize",
                      saleStatus === "sale" && "bg-green-400 hover:bg-green-400",
                      saleStatus === "ready" && "bg-sky-400 hover:bg-sky-400",
                      saleStatus === "not sale" &&
                        "bg-yellow-400 hover:bg-yellow-400",
                    )}
                  >
                    {cargo?.is_sale ?? "-"}
                  </Badge>
                </div>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                <ShoppingCart className="size-5" />
              </div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <div className="mt-2">
                  <Badge
                    className={cn(
                      "rounded min-w-24 justify-center text-black font-normal capitalize",
                      isCargoOnline
                        ? "bg-blue-400 hover:bg-blue-400"
                        : "bg-purple-400 hover:bg-purple-400",
                    )}
                  >
                    {cargo?.type ?? "-"}
                  </Badge>
                </div>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                <Tag className="size-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full rounded-md border border-sky-400/80 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">Scan Bag Cargo</h2>
        <form
          className="mt-4 flex w-full flex-col gap-3 md:flex-row md:items-center"
          onSubmit={handleScanSubmit}
        >
          <div className="relative w-full md:w-2/5">
            <ScanText className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              ref={scanRef}
              className="pl-9 border-sky-400/80 focus-visible:ring-sky-400"
              value={scanValue}
              onChange={(e) => setScanValue(e.target.value)}
              placeholder="Scan barcode bag..."
              disabled={isPendingAddBag}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            variant="liquid"
            disabled={!scanValue.trim() || isPendingAddBag}
          >
            {isPendingAddBag ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ScanText className="size-4" />
            )}
            Scan Bag
          </Button>
        </form>
      </div>

      <div className="w-full rounded-md border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold">List Bag</h2>
          </div>
          <div className="flex items-center gap-3 w-full md:w-2/5">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-9 border-sky-400/80 focus-visible:ring-sky-400"
                value={searchBag}
                onChange={(e) => {
                  setPage(1);
                  setSearchBag(e.target.value);
                }}
                placeholder="Search bag..."
              />
            </div>
            <TooltipProviderPage value="Reset Search">
              <Button
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant="outline"
                onClick={() => {
                  setPage(1);
                  setSearchBag("");
                  refetch();
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </TooltipProviderPage>
          </div>

          <DataTable
            columns={columnBag}
            data={bags}
            isLoading={loading}
            isSticky
            maxHeight="h-[45vh]"
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
