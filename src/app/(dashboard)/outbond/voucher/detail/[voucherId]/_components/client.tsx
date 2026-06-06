"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Edit3, Gift, Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetDetailVoucher } from "../../../_api/use-get-detail-voucher";
import { useUpdateVoucher } from "../../../_api/use-update-voucher";
import { useGetListBuyer } from "../_api/use-get-list-buyer";
import { useAssignVoucherBuyer } from "../_api/use-assign-voucher-buyer";

const DialogEditVoucher = dynamic(() => import("./dialog-edit-voucher"), {
  ssr: false,
});

const emptyInput = {
  name: "",
  amount: "",
  max_value: "",
  max_weeks: "",
  is_active: true,
};

const getVoucherValue = (voucher: any, key: string, fallbackKey?: string) =>
  voucher?.[key] ?? (fallbackKey ? voucher?.[fallbackKey] : undefined);

export const Client = () => {
  const params = useParams();
  const voucherId = params.voucherId;
  const [isMounted, setIsMounted] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [input, setInput] = useState(emptyInput);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [buyerId, setBuyerId] = useState("");
  const searchBuyerValue = useDebounce(buyerSearch);

  const {
    data,
    isLoading,
    isRefetching,
    error,
    isError,
    isSuccess,
  } = useGetDetailVoucher({ id: voucherId });

  const {
    data: dataBuyer,
    isLoading: isLoadingBuyer,
    isError: isErrorBuyer,
    error: errorBuyer,
  } = useGetListBuyer({ q: searchBuyerValue });

  const { mutate: mutateUpdate, isPending: isPendingUpdate } =
    useUpdateVoucher();
  const { mutate: mutateAssignBuyer, isPending: isPendingAssignBuyer } =
    useAssignVoucherBuyer();

  const voucher = useMemo(() => {
    return data?.data?.data?.resource;
  }, [data]);

  const buyers: any[] = useMemo(() => {
    const buyerResource = dataBuyer?.data?.data?.resource;

    if (Array.isArray(buyerResource)) return buyerResource;
    if (Array.isArray(buyerResource?.data)) return buyerResource.data;
    return [];
  }, [dataBuyer]);

  const voucherBuyers: any[] = useMemo(() => {
    return voucher?.buyers ?? voucher?.voucher_buyers ?? [];
  }, [voucher]);

  useEffect(() => {
    if (isSuccess && voucher) {
      setInput({
        name: getVoucherValue(voucher, "name", "name_voucher") ?? "",
        amount: String(getVoucherValue(voucher, "amount", "amount_voucher") ?? ""),
        max_value: String(
          getVoucherValue(voucher, "max_value", "max_value_voucher") ?? ""
        ),
        max_weeks: String(
          voucher?.max_weeks ?? voucher?.max_week ?? ""
        ),
        is_active: voucher?.is_active ?? voucher?.status === "active",
      });
    }
  }, [isSuccess, voucher]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Voucher",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  useEffect(() => {
    alertError({
      isError: isErrorBuyer,
      error: errorBuyer as AxiosError,
      data: "Buyer",
      action: "get data",
      method: "GET",
    });
  }, [isErrorBuyer, errorBuyer]);

  const handleUpdate = () => {
    const body = {
      name: input.name,
      amount: Number(input.amount || 0),
      max_value: Number(input.max_value || 0),
      max_weeks: Number(input.max_weeks || 0),
      is_active: input.is_active,
    };

    mutateUpdate(
      { id: voucherId, body },
      {
        onSuccess: () => {
          setOpenEdit(false);
        },
      }
    );
  };

  const handleAssignBuyer = () => {
    mutateAssignBuyer(
      { id: voucherId, body: { buyer_id: buyerId } },
      {
        onSuccess: () => {
          setBuyerId("");
        },
      }
    );
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isLoading) {
    return <Loading />;
  }

  if (isError && (error as AxiosError)?.status === 403) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  const isActive = voucher?.is_active ?? voucher?.status === "active";

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <DialogEditVoucher
        open={openEdit}
        onCloseModal={() => setOpenEdit(false)}
        input={input}
        setInput={setInput}
        handleSubmit={handleUpdate}
        isPending={isPendingUpdate}
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
            <BreadcrumbLink href="/outbond/voucher">Voucher</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Detail</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="w-full rounded-md shadow">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-sky-700" />
            <CardTitle className="text-xl">Detail Voucher</CardTitle>
            {isRefetching && (
              <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
            )}
          </div>
          <Button variant="outline" asChild className="border-sky-400">
            <Link href="/outbond/voucher">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-5">
          <Card className="rounded-md border-sky-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="text-base">
                {getVoucherValue(voucher, "name", "name_voucher") ?? "-"}
              </CardTitle>
              <Button
                onClick={() => setOpenEdit(true)}
                className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black"
                variant={"outline"}
                disabled={isPendingUpdate}
              >
                {isPendingUpdate ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Edit3 className="w-4 h-4 mr-1" />
                )}
                Edit Detail
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Code</p>
                <p className="font-semibold">
                  {getVoucherValue(voucher, "code", "code_voucher") ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-semibold">
                  {formatRupiah(
                    getVoucherValue(voucher, "amount", "amount_voucher") ?? 0
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Max Value</p>
                <p className="font-semibold">
                  {formatRupiah(
                    getVoucherValue(voucher, "max_value", "max_value_voucher") ??
                      0
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Max Weeks</p>
                <p className="font-semibold">
                  {voucher?.max_weeks ?? voucher?.max_week ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Usage</p>
                <p className="font-semibold">
                  {voucher?.usage ?? voucher?.usage_voucher ?? voucher?.used_count ?? 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge
                  className={cn(
                    "rounded-full text-black shadow-none font-normal",
                    isActive
                      ? "bg-sky-300 hover:bg-sky-300"
                      : "bg-gray-200 hover:bg-gray-200"
                  )}
                >
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border-sky-200 shadow-none mt-4">
            <CardHeader>
              <CardTitle className="text-base">Input Select Buyer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <Label>Search Buyer</Label>
                  <Input
                    className="border-sky-400/80 focus-visible:ring-sky-400"
                    placeholder="Search buyer..."
                    value={buyerSearch}
                    onChange={(e) => setBuyerSearch(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Buyer</Label>
                  <Select value={buyerId} onValueChange={setBuyerId}>
                    <SelectTrigger className="border-sky-400/80 focus:ring-sky-400">
                      <SelectValue placeholder="Select buyer" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingBuyer ? (
                        <SelectItem value="loading" disabled>
                          Loading buyer...
                        </SelectItem>
                      ) : buyers.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Buyer not found
                        </SelectItem>
                      ) : (
                        buyers.map((buyer) => (
                          <SelectItem key={buyer.id} value={String(buyer.id)}>
                            {buyer.name_buyer ?? buyer.name ?? "-"}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <TooltipProviderPage value="Add buyer to voucher">
                  <Button
                    onClick={handleAssignBuyer}
                    disabled={!buyerId || isPendingAssignBuyer}
                    className="items-center h-9 bg-sky-400/80 hover:bg-sky-400 text-black"
                    variant="outline"
                  >
                    {isPendingAssignBuyer ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <PlusCircle className="w-4 h-4 mr-1" />
                    )}
                    Add Buyer
                  </Button>
                </TooltipProviderPage>
              </div>
              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-3 bg-sky-100/70 text-sm font-semibold px-3 py-2">
                  <p>Name</p>
                  <p>Phone</p>
                  <p>Address</p>
                </div>
                {voucherBuyers.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-6">
                    No buyer selected
                  </p>
                ) : (
                  voucherBuyers.map((buyer) => (
                    <div
                      className="grid grid-cols-3 text-sm px-3 py-2 border-t"
                      key={buyer.id}
                    >
                      <p>{buyer.name_buyer ?? buyer.name ?? "-"}</p>
                      <p>{buyer.phone_buyer ?? buyer.phone ?? "-"}</p>
                      <p>{buyer.address_buyer ?? buyer.address ?? "-"}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
