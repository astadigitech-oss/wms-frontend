"use client";

import {
  CalendarClock,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { AxiosError } from "axios";

import Forbidden from "@/components/403";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatRupiah } from "@/lib/utils";

import { useGetSummarySaldo } from "../_api/use-get-summary-saldo";

type SaldoBreakdown = {
  qty: number;
  location: string;
  total_price: number | null;
  total_price_before: number;
};

type SaldoResponse = {
  breakdown: SaldoBreakdown[];
  total_qty: number;
  total_price: number;
  total_price_before: number;
  meta?: {
    as_of: string;
    source: string;
  };
};

const formatNumber = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID").format(value);
};

const formatLocation = (value: string) => {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const Client = () => {
  const { data, refetch, isLoading, isRefetching, isError, error } =
    useGetSummarySaldo();

  if (isError && (error as AxiosError).status === 403) {
    return (
      <div className="flex min-h-screen w-full flex-col items-start bg-gray-100 p-4">
        <Forbidden />
      </div>
    );
  }


  const saldo: SaldoResponse | undefined =
    data?.data?.data;
  const meta = data?.data?.meta;
  const breakdown = saldo?.breakdown ?? [];
  // const totalQty = saldo?.total_qty ?? 0;
  const stagingReguler = breakdown.find(
    (item) => item.location === "staging_reguler",
  );
  const displayReguler = breakdown.find(
    (item) => item.location === "display_reguler",
  );
  const displayColor = breakdown.find(
    (item) => item.location === "display_color",
  );
  const stagingSku = breakdown.find((item) => item.location === "staging_sku");
  const bundle = breakdown.find((item) => item.location === "bundle");
  const hasLocationData =
    stagingReguler || displayReguler || displayColor || stagingSku || bundle;

  const totalCards = [
    {
      title: "Total Quantity",
      value: formatNumber(saldo?.total_qty),
      icon: Package,
      className: "border-sky-200 bg-sky-50 text-sky-700",
    },
    {
      title: "Total Price",
      value: formatRupiah(saldo?.total_price ?? 0),
      icon: Wallet,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    {
      title: "Total Price Before",
      value: formatRupiah(saldo?.total_price_before ?? 0),
      icon: RefreshCw,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
  ];

  const renderLocationCard = (item?: SaldoBreakdown) => {
    if (!item) return null;

    // const percentage =
    //   totalQty > 0 ? Math.min((item.qty / totalQty) * 100, 100) : 0;

    return (
      <Card className="rounded-md border border-gray-200 bg-white">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Location
              </p>
              <h3 className="mt-1 text-lg font-bold text-gray-900">
                {formatLocation(item.location)}
              </h3>
            </div>
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md border border-sky-200 bg-sky-50 text-sky-700">
              <MapPin className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Qty</p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {formatNumber(item.qty)}
              </p>
            </div>
            {/* <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Contribution</p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {percentage.toFixed(2)}%
              </p>
            </div> */}
          </div>

          <div className="mt-4 space-y-3">
            {/* <div>
              <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                <span>Qty Ratio</span>
                <span>{formatNumber(item.qty)} pcs</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-sky-400"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div> */}

            <div className="grid grid-cols-1 gap-3 border-t pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">Total Price</span>
                <span className="text-right text-sm font-semibold text-gray-900">
                  {item.total_price === null
                    ? "-"
                    : formatRupiah(item.total_price)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">
                  Total Price Before
                </span>
                <span className="text-right text-sm font-semibold text-gray-900">
                  {formatRupiah(item.total_price_before)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 bg-gray-100 p-4 md:p-6">
      <Card className="rounded-md bg-white">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Dashboard</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Summary Saldo Movement
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Last Update: {(meta?.as_of)}
              </span>
              {meta?.source && (
                <span className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-medium capitalize text-sky-700">
                  {meta.source}
                </span>
              )}
            </div>
          </div>

          <Button
            onClick={() => refetch()}
            className="w-full border-sky-400 text-black hover:bg-sky-50 md:w-auto"
            variant="outline"
            disabled={isLoading || isRefetching}
          >
            {isLoading || isRefetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Reload
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {totalCards.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className="rounded-md border bg-white">
              <CardContent className="flex min-h-32 items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">
                    {item.title}
                  </p>
                  <p className="mt-3 break-words text-2xl font-bold text-gray-900">
                    {isLoading ? "-" : item.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-11 w-11 flex-none items-center justify-center rounded-md border",
                    item.className,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-md bg-white">
        <CardContent className="p-5">
          <div className="mb-5 flex flex-col gap-1">
            <h2 className="text-xl font-bold text-gray-900">Location</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <Card
                  key={index}
                  className="h-60 animate-pulse rounded-md bg-gray-50 shadow-none"
                />
              ))
            ) : hasLocationData ? (
              <>
                {renderLocationCard(stagingReguler)}
                {renderLocationCard(displayReguler)}
                {renderLocationCard(displayColor)}
                {renderLocationCard(stagingSku)}
                {renderLocationCard(bundle)}
              </>
            ) : (
              <Card className="col-span-full rounded-md bg-white shadow-none">
                <CardContent className="p-10 text-center font-semibold">
                  No Data Viewed.
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
