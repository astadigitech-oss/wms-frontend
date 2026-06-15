"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  TicketPercent,
} from "lucide-react";
import { AxiosError } from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useGetListVoucherBuyer } from "../_api/use-get-list-voucher-buyer";
import { usePakaiVoucher } from "../_api/use-pakai-voucher";
// import { useLepasVoucher } from "../_api/use-lepas-voucher";

const getVoucherValue = (voucher: any, key: string, fallbackKey?: string) =>
  voucher?.[key] ?? (fallbackKey ? voucher?.[fallbackKey] : undefined);

const getVoucherAmount = (voucher: any) =>
  Number(
    getVoucherValue(voucher, "amount", "amount_voucher") ??
      voucher?.voucher ??
      voucher?.nominal ??
      0
  );

const DialogVoucherRank = ({
  open,
  onCloseModal,
  data,
  buyerId,
  grandTotal,
  selectedVoucherId,
  // hasVoucherRank,
  setVoucher,
  isDirty,
  setIsDirty,
}: {
  open: boolean;
  onCloseModal: () => void;
  data: any;
  buyerId: any;
  grandTotal: number;
  selectedVoucherId: any;
  hasVoucherRank: boolean;
  setVoucher: any;
  isDirty: any;
  setIsDirty: any;
}) => {
  const [search, setSearch] = useState("");
  const searchValue = useDebounce(search);
  const [page, setPage] = useState(1);
  const [metaPage, setMetaPage] = useState({
    last: 1,
    from: 1,
    total: 1,
    perPage: 1,
  });

  const {
    data: dataVoucher,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListVoucherBuyer({
    id: buyerId,
    p: page,
    q: searchValue,
    enabled: open,
  });
  const { mutate: mutatePakaiVoucher, isPending: isPendingPakaiVoucher } =
    usePakaiVoucher();
  // const { mutate: mutateLepasVoucher, isPending: isPendingLepasVoucher } =
  //   useLepasVoucher();

  const voucherResource = useMemo(() => {
    return dataVoucher?.data?.data?.resource;
  }, [dataVoucher]);

  const voucherList: any[] = useMemo(() => {
    if (Array.isArray(voucherResource)) return voucherResource;
    if (Array.isArray(voucherResource?.data)) return voucherResource.data;
    return [];
  }, [voucherResource]);

  const loading =
    isLoading ||
    isRefetching ||
    isPending ||
    isPendingPakaiVoucher;
    // isPendingLepasVoucher;

  useEffect(() => {
    if (!open) {
      setSearch("");
      setPage(1);
    }
  }, [open]);

  useEffect(() => {
    setPage(1);
  }, [searchValue]);

  useEffect(() => {
    if (!voucherResource || Array.isArray(voucherResource)) return;

    setPaginate({
      isSuccess,
      data: dataVoucher,
      dataPaginate: voucherResource,
      setPage,
      setMetaPage,
    });
  }, [dataVoucher, isSuccess, voucherResource]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Voucher Rank",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  const handleSelect = (voucher: any) => {
    const amount = getVoucherAmount(voucher);
    const code = getVoucherValue(voucher, "code", "code_voucher") ?? "";
    const name = getVoucherValue(voucher, "name", "name_voucher") ?? "";

    mutatePakaiVoucher(
      { body: { voucher_id: voucher?.id } },
      {
        onSuccess: () => {
          setVoucher((prev: any) => ({
            ...prev,
            voucherRankAmount: String(amount),
            voucherRankId: voucher?.id ?? "",
            voucherRankName: name,
            voucherRankCode: code,
            voucherRankAvailable: true,
            voucherRankValue: String(amount),
          }));
          onCloseModal();
          if (!isDirty) {
            setIsDirty(true);
          }
        },
      }
    );
  };

  // const handleClear = () => {
  //   mutateLepasVoucher(undefined, {
  //     onSuccess: () => {
  //       setVoucher((prev: any) => ({
  //         ...prev,
  //         voucherRankAmount: "0",
  //         voucherRankId: "",
  //         voucherRankName: "",
  //         voucherRankCode: "",
  //         voucherRankAvailable: false,
  //         voucherRankValue: "0",
  //       }));
  //       onCloseModal();
  //       if (!isDirty) {
  //         setIsDirty(true);
  //       }
  //     },
  //   });
  // };

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent onClose={false} className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Voucher Rank</DialogTitle>
          <DialogDescription>
            Select voucher rank from buyer voucher list
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm">
            <div>
              <p className="text-gray-600">Grand Total</p>
              <p className="font-semibold">{formatRupiah(grandTotal)}</p>
            </div>
            {/* <div>
              <p className="text-gray-600">Minimum Voucher Rank</p>
              <p className="font-semibold">{formatRupiah(5000000)}</p>
            </div> */}
            <div>
              <p className="text-gray-600">Product Price</p>
              <p className="font-semibold">{formatRupiah(data ?? 0)}</p>
            </div>
            {/* <div>
              <p className="text-gray-600">Status</p>
              <Badge className="rounded-full bg-emerald-200 text-emerald-800 hover:bg-emerald-200 shadow-none">
                Eligible
              </Badge>
            </div> */}
          </div>
          <div className="flex gap-2">
            <div className="relative w-full">
              <Label htmlFor="search-voucher-rank" className="sr-only">
                Search Voucher Rank
              </Label>
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="search-voucher-rank"
                className="pl-9 border-sky-400/80 focus-visible:ring-sky-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search voucher rank..."
                autoFocus
              />
            </div>
            <Button
              type="button"
              onClick={() => refetch()}
              variant="outline"
              className="w-9 px-0 border-sky-400 text-black hover:bg-sky-50"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </Button>
          </div>
          <div className="max-h-[45vh] overflow-y-auto rounded-md border border-sky-400/80 p-2">
            {loading ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm">
                <Loader2 className="size-5 animate-spin" />
                Loading...
              </div>
            ) : voucherList.length > 0 ? (
              <div className="flex flex-col gap-2">
                {voucherList.map((voucher, index) => {
                  const amount = getVoucherAmount(voucher);
                  const code =
                    getVoucherValue(voucher, "code", "code_voucher") ?? "-";
                  const name =
                    getVoucherValue(voucher, "name", "name_voucher") ?? "-";
                  const usage =
                    voucher?.usage ??
                    voucher?.usage_voucher ??
                    voucher?.used_count ??
                    0;
                  const maxUsage =
                    getVoucherValue(voucher, "max_usage", "max_value_voucher") ??
                    0;
                  const maxWeek = voucher?.max_week ?? "-";
                  const isActive =
                    voucher?.is_active ?? voucher?.status === "active";
                  const isSelected = selectedVoucherId === voucher?.id;

                  return (
                    <button
                      type="button"
                      key={`${voucher?.id ?? code}-${index}`}
                      onClick={() => handleSelect(voucher)}
                      disabled={loading}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md border p-3 text-left transition hover:border-emerald-400 hover:bg-emerald-50",
                        isSelected
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 bg-white"
                      )}
                    >
                      <div className="flex size-10 flex-none items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <TicketPercent className="size-5" />
                      </div>
                      <div className="grid w-full grid-cols-[1fr_auto] gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{name}</p>
                            <Badge className="rounded-full bg-gray-100 text-gray-700 hover:bg-gray-100 shadow-none">
                              {code}
                            </Badge>
                            {isActive && (
                              <Badge className="rounded-full bg-sky-100 text-sky-700 hover:bg-sky-100 shadow-none">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-600">
                            Usage {usage} | Max {formatRupiah(maxUsage)} | Max
                            week {maxWeek}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 font-semibold">
                          {formatRupiah(amount)}
                          {isSelected && (
                            <CheckCircle2 className="size-4 text-emerald-600" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-gray-500">
                No voucher rank found.
              </div>
            )}
          </div>
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
          {/* <div className="flex w-full gap-2">
            <Button
              className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
              onClick={onCloseModal}
              type="button"
            >
              Cancel
            </Button>
            <Button
              className="w-full bg-red-100 text-red-700 hover:bg-red-100"
              onClick={handleClear}
              type="button"
              disabled={!hasVoucherRank || loading}
            >
              Clear Voucher Rank
            </Button>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogVoucherRank;
