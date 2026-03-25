"use client";

import {
  CalendarIcon,
  ChevronDown,
  FileDown,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { MouseEvent, useEffect, useMemo, useState } from "react";
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
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { format, subDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { useGetListSummaryBoth } from "../_api/use-get-list-summary-both";
import { useExportInboundDataDay } from "../_api/use-export-summary-inbound-day";
import { useExportOutboundDataDay } from "../_api/use-export-summary-outbound-day";
import { useExportInboundData } from "../_api/use-export-summary-inbound";
import { useExportOutboundData } from "../_api/use-export-summary-outbound";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGetSummaryCategory } from "../_api/use-get-summary-category";
import { useGetSummaryBalance } from "../_api/use-get-summary-balance";
import { useExportSummaryCategory } from "../_api/use-export-summary-category";

type DestinationMC = {
  date: string;
  inbound?: any;
  outbound?: any;
};

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());
  const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];
  const years = Array.from({ length: 10 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return y;
  });
  const [activeTab, setActiveTab] = useState<
    "staging" | "display" | "cargo" | "repair" | "sku"
  >("cargo");
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: today,
  });
  const { mutate: mutateExportInbound, isPending: isPendingExportInbound } =
    useExportInboundData();
  const { mutate: mutateExportOutbound, isPending: isPendingExportOutbound } =
    useExportOutboundData();
  const { mutate: exportInboundDay, isPending: isPendingInbound } =
    useExportInboundDataDay();
  const { mutate: exportOutboundDay, isPending: isPendingOutbound } =
    useExportOutboundDataDay();
  const {
    mutate: mutateExportSummaryCategory,
    isPending: isPendingExportSummaryCategory,
  } = useExportSummaryCategory();

  // data search, page
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  // get data utama
  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListSummaryBoth({
    p: page,
    q: searchValue,
    date_from: date?.from ? format(date.from, "yyyy-MM-dd") : "",
    date_to: date?.to
      ? format(date.to, "yyyy-MM-dd")
      : format(today, "yyyy-MM-dd"),
  });

  const { data: dataSummaryCategory } = useGetSummaryCategory({
    month: month ?? today.getMonth() + 1,
    year: year ?? today.getFullYear(),
  });

  const {
    data: dataSummaryBalance,
    isLoading: isLoadingSummaryBalance,
    isPending: isPendingSummaryBalance,
  } = useGetSummaryBalance({
    month: month ?? today.getMonth() + 1,
    year: year ?? today.getFullYear(),
  });

  const loadingSummaryBalance =
    isLoadingSummaryBalance || isPendingSummaryBalance;

  const dataBoth = useMemo(() => {
    return data?.data?.data?.resource;
  }, [data]);

  const chartCategoryData = useMemo(() => {
    const resource = dataSummaryCategory?.data?.data?.resource?.chart;

    return Array.isArray(resource)
      ? resource.map((item: any) => ({
          name: item.category_name,
          value: item.total_qty,
        }))
      : [];
  }, [dataSummaryCategory]);

  const chartSaldoData = useMemo(() => {
    const resource = dataSummaryBalance?.data?.data?.resource?.chart;

    if (!Array.isArray(resource)) return [];

    return resource.map((item: any) => ({
      label: item.name,
      value: Number(item.total_qty) || 0,
      isAwal: item.name.toLowerCase().includes("awal"),
    }));
  }, [dataSummaryBalance]);

  const summaryData = dataSummaryCategory?.data?.data?.resource;

  const tableCategoryData = useMemo(() => {
    if (!summaryData) return [];

    const dataMap: any = {
      staging: summaryData.staging,
      display: summaryData.display,
      cargo: summaryData.cargo,
      repair: summaryData.repair,
      sku: summaryData.sku,
    };

    const selected = dataMap[activeTab] ?? [];

    return selected.map((item: any, index: number) => ({
      no: index + 1,
      category: item.category_name ?? "-",
      qty_bag: item.total_qty_bag ?? 0,
      qty_product: item.total_qty_product ?? 0,
      old_price: item.total_old_price ?? 0,
      new_price: item.total_new_price ?? 0,
    }));
  }, [summaryData, activeTab]);

  const columnCategory: ColumnDef<any>[] = useMemo(() => {
    // khusus SKU
    if (activeTab === "sku") {
      return [
        {
          header: "No",
          accessorKey: "no",
        },
        {
          header: "Code Documents",
          accessorKey: "code_documents",
        },
        {
          header: "Qty Product",
          accessorKey: "qty_product",
        },
        {
          header: "Original Price",
          cell: ({ row }) => formatRupiah(row.original.old_price),
        },
      ];
    }

    // default (staging, display, cargo, repair)
    return [
      {
        header: "No",
        accessorKey: "no",
      },
      {
        header: "Category",
        accessorKey: "category",
      },
      {
        header: "Qty Bag",
        accessorKey: "qty_bag",
      },
      {
        header: "Qty Product",
        accessorKey: "qty_product",
      },
      {
        header: "Original Price",
        cell: ({ row }) => formatRupiah(row.original.old_price),
      },
      {
        header: "Sale Price",
        cell: ({ row }) => formatRupiah(row.original.new_price),
      },
    ];
  }, [activeTab]);

  // const chartCategoryData =
  // dataBoth?.category_inventory?.map((item: any) => ({
  //   name: item.category,
  //   value: item.total,
  // })) ?? [];

  // const chartSaldoData =
  //   dataBoth?.map((item: any) => ({
  //     date: item.date,
  //     masuk: item.inbound?.qty ?? 0,
  //     keluar: item.outbound?.qty ?? 0,
  //   })) ?? [];

  const loading = isPending || isRefetching || isLoading;

  const clearRange = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDate({
      from: undefined,
      to: new Date(),
    });
  };

  // get pagetination
  useEffect(() => {
    setPaginate({
      isSuccess: isSuccess,
      data: data,
      dataPaginate: data?.data.data.resource,
      setMetaPage: setMetaPage,
      setPage: setPage,
    });
  }, [data]);

  // isError get data
  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  const mergeInboundOutbound = (
    inbound: any[],
    outbound: any[],
  ): DestinationMC[] => {
    const map = new Map<string, DestinationMC>();

    inbound.forEach((item) => {
      map.set(item.inbound_date, {
        date: item.inbound_date,
        inbound: item,
        outbound: undefined,
      });
    });

    outbound.forEach((item) => {
      if (map.has(item.outbound_date)) {
        map.get(item.outbound_date)!.outbound = item;
      } else {
        map.set(item.outbound_date, {
          date: item.outbound_date,
          inbound: undefined,
          outbound: item,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  };

  const tableData = useMemo(() => {
    return mergeInboundOutbound(
      dataBoth?.inbound ?? [],
      dataBoth?.outbound ?? [],
    );
  }, [dataBoth]);

  const SummaryCard = ({
    title,
    value,
    qty,
    className,
    isLoading,
  }: {
    title: string;
    value?: React.ReactNode;
    qty?: string | number;
    className?: string;
    isLoading?: boolean;
  }) => (
    <div
      className={cn(
        "rounded-md border border-gray-300 bg-white p-4 flex flex-col justify-between",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>

      <div className="mt-1">
        <div className="text-xl font-semibold">{value ?? "-"}</div>

        {qty !== undefined && (
          <p className="text-sm text-gray-600 mt-1">
            Qty: <span className="font-medium">{qty}</span>
          </p>
        )}
      </div>
    </div>
  );

  // column data
  const columnDestinationMC: ColumnDef<DestinationMC>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">{row.index + 1}</div>
      ),
    },

    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const formatted = format(
          new Date(row.original.date),
          "iiii, dd MMMM yyyy",
        );
        return <div className="tabular-nums">{formatted}</div>;
      },
    },

    {
      header: "Qty In",
      cell: ({ row }) => <div>{row.original.inbound?.qty ?? "-"}</div>,
    },

    {
      header: "Qty Out",
      cell: ({ row }) => <div>{row.original.outbound?.qty ?? "-"}</div>,
    },

    {
      header: "Old Price In",
      cell: ({ row }) => (
        <div>
          {row.original.inbound
            ? formatRupiah(row.original.inbound.old_price_product)
            : "-"}
        </div>
      ),
    },

    {
      header: "Old Price Out",
      cell: ({ row }) => (
        <div>
          {row.original.outbound
            ? formatRupiah(row.original.outbound.old_price_product)
            : "-"}
        </div>
      ),
    },

    {
      header: "New Price In",
      cell: ({ row }) => (
        <div>
          {row.original.inbound
            ? formatRupiah(row.original.inbound.new_price_product)
            : "-"}
        </div>
      ),
    },

    {
      header: "New Price Out",
      cell: ({ row }) => (
        <div>
          {row.original.outbound
            ? formatRupiah(row.original.outbound.display_price_product)
            : "-"}
        </div>
      ),
    },

    // {
    //   id: "action",
    //   header: () => <div className="text-center">Action</div>,
    //   cell: ({ row }) => (
    //     <div className="flex gap-4 justify-center items-center">
    //       <TooltipProviderPage value={<p>Export Data</p>}>
    //         <Button
    //           className="items-center w-9 px-0 h-9"
    //           variant="outline"
    //           disabled={isPendingExportDay}
    //           onClick={(e) => {
    //             e.preventDefault();
    //             handleExportDay(row.original.date);
    //           }}
    //         >
    //           {isPendingExportDay ? (
    //             <Loader2 className="w-4 h-4 animate-spin" />
    //           ) : (
    //             <FileDown className="w-4 h-4" />
    //           )}
    //         </Button>
    //       </TooltipProviderPage>
    //     </div>
    //   ),
    // },
    {
      id: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Popover>
            <TooltipProviderPage value={<p>Export Data</p>}>
              <PopoverTrigger asChild>
                <Button
                  className={cn(
                    "items-center p-0 w-9 h-9",
                    "border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50",
                    "disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed",
                  )}
                  variant="outline"
                  type="button"
                  disabled={isPendingInbound || isPendingOutbound}
                >
                  {isPendingInbound || isPendingOutbound ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                </Button>
              </PopoverTrigger>
            </TooltipProviderPage>

            <PopoverContent className="w-auto py-2">
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="justify-start px-3 text-sm"
                  onClick={() => handleExportInboundDay(row.original.date)}
                  disabled={!row.original.inbound || isPendingInbound}
                >
                  Export Inbound
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start px-3 text-sm"
                  onClick={() => handleExportOutboundDay(row.original.date)}
                  disabled={!row.original.outbound || isPendingOutbound}
                >
                  Export Outbound
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ),
    },
  ];

  const handleExportInbound = async () => {
    mutateExportInbound(
      {
        searchParams: {
          date_from: date?.from ? format(date.from, "yyyy-MM-dd") : "",
          date_to: date?.to ? format(date.to, "yyyy-MM-dd") : "",
        },
      },
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

  const handleExportOutbound = async () => {
    mutateExportOutbound(
      {
        searchParams: {
          date_from: date?.from ? format(date.from, "yyyy-MM-dd") : "",
          date_to: date?.to ? format(date.to, "yyyy-MM-dd") : "",
        },
      },
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

  const handleExportInboundDay = (date: string) => {
    exportInboundDay(
      {
        searchParams: {
          date_from: format(new Date(date), "yyyy-MM-dd"),
        },
      },
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

  const handleExportOutboundDay = (date: string) => {
    exportOutboundDay(
      {
        searchParams: {
          date_from: format(new Date(date), "yyyy-MM-dd"),
        },
      },
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

  const handleExportSummaryCategory = () => {
    mutateExportSummaryCategory(
      {
        searchParams: {
          month: month ?? today.getMonth() + 1,
          year: year ?? today.getFullYear(),
        },
      },
      {
        onSuccess: (res) => {
          const link = document.createElement("a");
          link.href = res.data.data.resource.download_url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
      },
    );
  };

  useEffect(() => {
    refetch();
  }, [date]);

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
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Dashboard</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Summary Report Product</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Summary Report</h2>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-sky-400/80"
              >
                <CalendarIcon className="w-4 h-4" />
                {months.find((m) => m.value === month)?.label ??
                  months[today.getMonth()].label}{" "}
                {year ?? today.getFullYear()}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-4 w-56" align="end">
              <div className="flex flex-col gap-3">
                {/* MONTH */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Month</p>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                  >
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* YEAR */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Year</p>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 gap-6">
          {/* Qty */}
          <div className="grid grid-cols-2 gap-4">
            <SummaryCard
              title="Qty Masuk"
              value={dataBoth?.summary_report?.qty_in}
            />
            <SummaryCard
              title="Qty Keluar"
              value={dataBoth?.summary_report?.qty_out}
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <SummaryCard
              title="Sale Price Masuk"
              value={formatRupiah(dataBoth?.summary_report?.price_in)}
            />
            <SummaryCard
              title="Sale Price Keluar"
              value={formatRupiah(dataBoth?.summary_report?.price_out)}
            />
          </div>
        </div>

        {/* CHART SECTION */}
        <div className="grid grid-cols-3 gap-6 mt-4">
          {/* LEFT - BAR CHART */}
          <div className="col-span-2 bg-white border rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Total Category Inventory</h3>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartCategoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#7dd3fc"
                  strokeWidth={2}
                  stroke="#38bdf8"
                  radius={[4, 4, 4, 4]}
                  label={{ position: "top", fill: "black" }}
                  activeBar={{ fill: "#38bdf8" }}
                />{" "}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* RIGHT - LINE CHART */}
          <div className="bg-white border rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Total Saldo</h3>
            </div>

            {loadingSummaryBalance ? (
              <div className="flex items-center justify-center h-[250px]">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartSaldoData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="label" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={({ cx, cy, payload, index }: any) => (
                      <circle
                        key={`${payload.label}-${index}`}
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill={payload.isAwal ? "#ef4444" : "#3b82f6"}
                      />
                    )}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-md p-4 mt-6">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Summary Category Bag</h3>
            <TooltipProviderPage value={<p>Export Data</p>}>
              <Button
                onClick={handleExportSummaryCategory}
                className={cn(
                  "items-center w-9 px-0 h-9",
                  "border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50",
                  "disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed",
                )}
                variant="outline"
                disabled={isPendingExportSummaryCategory}
              >
                {isPendingExportSummaryCategory ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
              </Button>
            </TooltipProviderPage>
          </div>

          {/* TABS */}
          <div className="flex gap-6 border-b mb-4">
            {["staging", "display", "cargo", "repair", "sku"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-2 capitalize ${
                  activeTab === tab
                    ? "border-b-2 border-black font-semibold"
                    : "text-gray-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TABLE */}
          <DataTable columns={columnCategory} data={tableCategoryData ?? []} />
        </div>

        <div className="flex flex-col w-full gap-4">
          <h2 className="text-xl font-bold mt-4">List Summary Report</h2>
          <div className="flex gap-2 items-center w-full justify-between">
            <div className="flex items-center gap-3 w-full">
              <Input
                className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                value={dataSearch}
                onChange={(e) => setDataSearch(e.target.value)}
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
                    className={cn("w-4 h-4", loading ? "animate-spin" : "")}
                  />
                </Button>
              </TooltipProviderPage>
              <div className="px-3 h-10 py-1 border rounded flex gap-3 items-center text-sm border-gray-500">
                {/* {date?.from && date?.to && (
                  <> */}
                {date?.from ? (
                  <p>
                    {format(date.from, "dd MMM yyyy")} -{" "}
                    {format(date.to!, "dd MMM yyyy")}
                  </p>
                ) : (
                  <p className="italic text-gray-500">
                    Until {format(date?.to ?? today, "dd MMM yyyy")}
                  </p>
                )}

                <button onClick={clearRange}>
                  <XCircle className="w-4 h-4 text-red-500" />
                </button>
                {/* </>
                )} */}
                <p className="w-[1px] h-full bg-black" />
                <Dialog>
                  <DialogTrigger asChild>
                    <button onClick={() => {}}>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="w-auto max-w-5xl p-3 border-gray-300">
                    <DialogHeader>
                      <DialogTitle>Pick a Date Range</DialogTitle>
                    </DialogHeader>
                    <div className="w-full flex items-center gap-4 text-sm">
                      <div className="w-full items-center flex justify-start px-3 border border-sky-400/80 rounded h-9">
                        <CalendarIcon className="size-4 mr-2" />
                        {(date?.from && format(date.from, "MMMM dd, yyyy")) ??
                          "Pick a date"}{" "}
                        -{" "}
                        {(date?.to && format(date.to, "MMMM dd, yyyy")) ??
                          "Pick a date"}
                      </div>

                      <Popover
                        open={isOpen}
                        onOpenChange={setIsOpen}
                        modal={false}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            className="flex-none border-sky-400/80 hover:border-sky-400 hover:bg-sky-50 rounded"
                            variant={"outline"}
                            size={"icon"}
                          >
                            <ChevronDown className="size-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-fit" align="end">
                          <Command>
                            <CommandList>
                              <CommandGroup>
                                <CommandItem
                                  onSelect={() => {
                                    setDate({
                                      from: subDays(new Date(), 7),
                                      to: new Date(),
                                    });
                                    setIsOpen(false);
                                  }}
                                >
                                  Last Week
                                </CommandItem>
                                <CommandItem
                                  onSelect={() => {
                                    setDate({
                                      from: subDays(new Date(), 30),
                                      to: new Date(),
                                    });
                                    setIsOpen(false);
                                  }}
                                >
                                  Last Month
                                </CommandItem>
                                <CommandItem
                                  onSelect={() => {
                                    setDate({
                                      from: subDays(new Date(), 60),
                                      to: new Date(),
                                    });
                                    setIsOpen(false);
                                  }}
                                >
                                  2 Months ago
                                </CommandItem>
                                <CommandItem
                                  onSelect={() => {
                                    setDate({
                                      from: subDays(new Date(), 90),
                                      to: new Date(),
                                    });
                                    setIsOpen(false);
                                  }}
                                >
                                  3 Months ago
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="w-full p-2 border rounded border-sky-400/80">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={subDays(new Date(), 30)}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex gap-2 ml-auto">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleExportInbound();
                  }}
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  disabled={isPendingExportInbound}
                  variant={"outline"}
                >
                  {isPendingExportInbound ? (
                    <Loader2 className={"w-4 h-4 mr-1 animate-spin"} />
                  ) : (
                    <FileDown className={"w-4 h-4 mr-1"} />
                  )}
                  Export Inbound
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleExportOutbound();
                  }}
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  disabled={isPendingExportOutbound}
                  variant={"outline"}
                >
                  {isPendingExportOutbound ? (
                    <Loader2 className={"w-4 h-4 mr-1 animate-spin"} />
                  ) : (
                    <FileDown className={"w-4 h-4 mr-1"} />
                  )}
                  Export Outbound
                </Button>
              </div>
            </div>
          </div>
          {dataBoth?.status === false ? (
            <div className="w-full text-center py-10 text-red-500 font-semibold">
              {dataBoth?.message ?? "Terjadi kesalahan, data tidak tersedia."}
            </div>
          ) : (
            <DataTable columns={columnDestinationMC} data={tableData ?? []} />
          )}{" "}
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
