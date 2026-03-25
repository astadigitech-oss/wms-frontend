"use client";

import React, { MouseEvent, useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { cn, formatRupiah } from "@/lib/utils";
import { useGetStorageReport } from "../_api/use-get-storage-report";
import { DataTable } from "@/components/data-table";
import { Label } from "@/components/ui/label";
import {
  FileDown,
  LayoutGrid,
  LayoutList,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useQueryState } from "nuqs";
import { useDebounce } from "@/hooks/use-debounce";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useExportStorageReport } from "../_api/use-export-storage-report";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChartData {
  category_product: string;
  total_category: number;
  total_price_category: string;
}

const DONUT_COLORS = {
  dump: "#ef4444",
  scrap: "#6b7280",
};

export const columnsStorage: ColumnDef<any>[] = [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">{row.index + 1}</div>
    ),
  },
  {
    accessorKey: "category_product",
    header: "Category Name",
  },
  {
    accessorKey: "total_category",
    header: () => <div className="text-center">Total Product</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.total_category}</div>
    ),
  },
  {
    accessorKey: "total_price_category",
    header: "Value Product",
    cell: ({ row }) => formatRupiah(row.original.total_price_category),
  },
];

export default function Client() {
  const [isMounted, setIsMounted] = useState(false);
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

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [layout, setLayout] = useQueryState("layout", { defaultValue: "list" });
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportStorageReport();
  const { data, isLoading, isPending,refetch, isRefetching, isError, error } =
    useGetStorageReport({
      month,
      year,
    });
  const [filterType, setFilterType] = useState("all");
  const loading = isLoading || isPending || isRefetching;

  const resource = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataChart: ChartData[] = useMemo(() => {
    return data?.data.data.resource.chart.category ?? [];
  }, [data]);

  const chartData = useMemo(() => {
    if (!resource) return [];

    const display = resource.chart.category || [];
    const staging = resource.chart_staging.category || [];
    const b2b = resource.chart_b2b.category || [];
    const dump = resource.chart_dump.category || [];
    const scrap = resource.chart_scrap_qcd.category || [];

    // ✅ ALL (TETAP SEPERTI KODE KAMU)
    if (filterType === "all") {
      const categories = [
        ...new Set([
          ...display.map((i: any) => i.category_product),
          ...staging.map((i: any) => i.category_product),
          ...b2b.map((i: any) => i.category_product),
          ...dump.map((i: any) => i.category_product),
          ...scrap.map((i: any) => i.category_product),
        ]),
      ];

      return categories.map((cat) => {
        const d = display.find((i: any) => i.category_product === cat);
        const s = staging.find((i: any) => i.category_product === cat);
        const b = b2b.find((i: any) => i.category_product === cat);
        const dp = dump.find((i: any) => i.category_product === cat);
        const sc = scrap.find((i: any) => i.category_product === cat);

        return {
          category: cat,
          display: d?.total_category ?? 0,
          staging: s?.total_category ?? 0,
          b2b: b?.total_category ?? 0,
          dump: dp?.total_category ?? 0,
          scrap: sc?.total_category ?? 0,
        };
      });
    }

    // ✅ SINGLE TYPE (WAJIB ADA value)
    const map: any = {
      display,
      staging,
      b2b,
      dump,
      scrap,
    };

    const selected = map[filterType] || [];

    return selected.map((item: any) => ({
      category: item.category_product,
      value: Number(item.total_category || 0), // 🔥 penting
    }));
  }, [resource, filterType]);

  // const chartData = useMemo(() => {
  //   if (!resource) return [];
  //   console.log({
  //     display: resource.chart.category,
  //     staging: resource.chart_staging.category,
  //     b2b: resource.chart_b2b.category,
  //     dump: resource.chart_dump.category,
  //     scrap: resource.chart_scrap_qcd.category,
  //   });

  //   const display = resource.chart.category;
  //   const staging = resource.chart_staging.category;
  //   const b2b = resource.chart_b2b.category;
  //   const dump = resource.chart_dump.category;
  //   const scrap = resource.chart_scrap_qcd.category;

  //   // ✅ 1. ALL → PAKAI KODE LAMA PERSIS
  //   if (filterType === "all") {
  //     const categories = [
  //       ...new Set([
  //         ...display.map((i: any) => i.category_product),
  //         ...staging.map((i: any) => i.category_product),
  //         ...b2b.map((i: any) => i.category_product),
  //         ...dump.map((i: any) => i.category_product),
  //         ...scrap.map((i: any) => i.category_product),
  //       ]),
  //     ];

  //     return categories.map((cat) => {
  //       const d = display.find((i: any) => i.category_product === cat);
  //       const s = staging.find((i: any) => i.category_product === cat);
  //       const b = b2b.find((i: any) => i.category_product === cat);
  //       const dp = dump.find((i: any) => i.category_product === cat);
  //       const sc = scrap.find((i: any) => i.category_product === cat);

  //       return {
  //         category: cat,
  //         display: d?.total_category ?? 0,
  //         staging: s?.total_category ?? 0,
  //         b2b: b?.total_category ?? 0,
  //         dump: dp?.total_category ?? 0,
  //         scrap: sc?.total_category ?? 0,
  //       };
  //     });
  //   }

  //   // ✅ 2. SINGLE TYPE → FILTER
  //   const map: any = {
  //     display,
  //     staging,
  //     b2b,
  //     dump,
  //     scrap,
  //   };

  //   const selected = map[filterType] || [];

  //   return selected.map((item: any) => ({
  //     category: item.category_product,
  //     value: item.total_category,
  //   }));
  // }, [resource, filterType]);

  const donutData = [
    {
      name: "Dump",
      value: resource?.total_product_dump || 0,
      color: DONUT_COLORS.dump,
    },
    {
      name: "Scrap",
      value: resource?.total_product_scrap_qcd || 0,
      color: DONUT_COLORS.scrap,
    },
  ];

  const handleExport = async () => {
    mutateExport("", {
      onSuccess: (res) => {
        const link = document.createElement("a");
        link.href = res.data.data.resource;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  const clearSearch = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDataSearch("");
  };

  useEffect(() => {
    refetch();
  }, [month, year]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (isError && (error as AxiosError).status === 403) {
    return <Forbidden />;
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-100">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Dashboard</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Storage Report</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* TOTAL PRODUCT */}

      <Card>
        <CardHeader>
          <CardTitle>Total all produk</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-6">
          {loading ? (
            <>
              <div className="h-16 bg-gray-200 animate-pulse rounded" />
              <div className="h-16 bg-gray-200 animate-pulse rounded" />
            </>
          ) : (
            <>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Total Product</span>
                  <span>{resource?.total_all_product}</span>
                </div>
                <Progress value={resource?.total_percentage_product} />
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span>Total Value</span>
                  <span>{formatRupiah(resource?.total_all_price)}</span>
                </div>
                <Progress value={resource?.total_percentage_price} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* SUMMARY CARD */}

      <div className="grid grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 animate-pulse">
                  <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))
          : [
              {
                title: "Produk Staging",
                qty: resource.total_product_staging,
                price: resource.total_product_staging_price,
              },
              {
                title: "Produk Display",
                qty: resource.total_product_display,
                price: resource.total_product_display_price,
              },
              {
                title: "Produk SKU",
                qty: resource.total_product_sku,
                price: resource.total_product_sku_price,
              },
              {
                title: "Produk B2B",
                qty: resource.total_product_b2b,
                price: resource.total_product_b2b_price,
              },
            ].map((item, i) => <SummaryCard key={i} {...item} />)}
      </div>

      {/* COLOR + DONUT */}

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Produk Color</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 bg-gray-200 animate-pulse rounded"
                  />
                ))
              : resource.tag_products.color.map((item: any) => (
                  <div key={item.tag_product}>
                    <div className="flex justify-between text-sm">
                      <span>{item.tag_product}</span>
                      <span>{item.total_tag_product}</span>
                    </div>

                    <Progress value={item.percentage_tag_product} />

                    <div className="text-right text-xs text-gray-500">
                      {formatRupiah(item.total_price_tag_product)}
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produk Dump dan Scrap</CardTitle>
          </CardHeader>

          <CardContent className="flex justify-center">
            {loading ? (
              <div className="w-[220px] h-[220px] bg-gray-200 animate-pulse rounded-full" />
            ) : (
              <PieChart width={220} height={220}>
                <Pie
                  data={donutData}
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            )}
          </CardContent>
        </Card>
      </div>

      {/* LINE CHART */}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Produk category</CardTitle>

            <div className="flex gap-3 items-center">
              {/* FILTER TYPE */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-8 border rounded px-2 text-sm"
              >
                <option value="all">All Type</option>
                <option value="display">Display</option>
                <option value="staging">Staging</option>
                <option value="b2b">B2B</option>
                <option value="dump">Dump</option>
                <option value="scrap">Scrap</option>
              </select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-sky-400/80"
                  >
                    {months.find((m) => m.value === month)?.label} {year}
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
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-[320px]">
            {loading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse rounded" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {/* <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="display"
                    stroke="#16a34a"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="staging"
                    stroke="#000"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="b2b"
                    stroke="#3b82f6"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="dump"
                    stroke="#ef4444"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="scrap"
                    stroke="#6b7280"
                    strokeWidth={3}
                  />
                </LineChart> */}
                {/* <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  {filterType === "all" ? (
                    <>
                      <Line
                        dataKey="display"
                        stroke="#16a34a"
                        strokeWidth={3}
                      />
                      <Line dataKey="staging" stroke="#000" strokeWidth={3} />
                      <Line dataKey="b2b" stroke="#3b82f6" strokeWidth={3} />
                      <Line dataKey="dump" stroke="#ef4444" strokeWidth={3} />
                      <Line dataKey="scrap" stroke="#6b7280" strokeWidth={3} />
                    </>
                  ) : (
                    <Line dataKey="value" stroke="#16a34a" strokeWidth={3} />
                  )}
                </LineChart> */}
                <ResponsiveContainer width="100%" height="100%">
                  {filterType === "all" ? (
                    // ✅ MULTI LINE (PERSIS PUNYA KAMU)
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="display"
                        stroke="#16a34a"
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="staging"
                        stroke="#000"
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="b2b"
                        stroke="#3b82f6"
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="dump"
                        stroke="#ef4444"
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="scrap"
                        stroke="#6b7280"
                        strokeWidth={3}
                      />
                    </LineChart>
                  ) : (
                    // ✅ SINGLE LINE
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#16a34a"
                        strokeWidth={3}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}

      {/* <Card>
        <CardHeader>
          <CardTitle>List Product Per-Category</CardTitle>
        </CardHeader>

        <CardContent> */}

      <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 items-center flex-col">
        <div className="w-full flex flex-col gap-4">
          <h3 className="text-lg font-semibold">List Product Per-Category</h3>
          {loading ? (
            <div className="space-y-2"></div>
          ) : (
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center gap-5" style={{ width: "60%" }}>
                <div className="relative w-full flex items-center mb-0">
                  <Label className="absolute left-3" htmlFor="search">
                    <Search className="w-4 h-4" />
                  </Label>

                  <input
                    id="search"
                    value={dataSearch}
                    onChange={(e) => setDataSearch(e.target.value)}
                    className="w-full h-9 rounded outline-none px-10 text-xs border border-gray-500"
                  />

                  <button
                    onClick={clearSearch}
                    className={cn(
                      "h-5 w-5 absolute right-2 items-center justify-center outline-none",
                      dataSearch.length > 0 ? "flex" : "hidden",
                    )}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex border border-gray-500 rounded flex-none h-9 overflow-hidden">
                  <button
                    className={cn(
                      "w-9 h-full flex items-center justify-center outline-none",
                      layout === "list" ? "bg-sky-300" : "bg-transparent",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setLayout("list");
                    }}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>

                  <button
                    className={cn(
                      "w-9 h-full flex items-center justify-center outline-none",
                      layout === "grid" ? "bg-sky-300" : "bg-transparent",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setLayout("grid");
                    }}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleExport();
                }}
                className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                disabled={isPendingExport}
                variant={"outline"}
              >
                {isPendingExport ? (
                  <Loader2 className={"w-4 h-4 mr-1 animate-spin"} />
                ) : (
                  <FileDown className={"w-4 h-4 mr-1"} />
                )}
                Export Data
              </Button>
            </div>
          )}
        </div>

        {layout === "grid" ? (
          <div className="grid grid-cols-4 gap-4 w-full">
            {searchValue ? (
              dataChart.filter((item: any) =>
                item.category_product
                  .toLowerCase()
                  .includes(searchValue.toLowerCase()),
              ).length > 0 ? (
                dataChart
                  .filter((item: any) =>
                    item.category_product
                      .toLowerCase()
                      .includes(searchValue.toLowerCase()),
                  )
                  .map((item: any, i: number) => (
                    <div
                      key={item.category_product + i}
                      className="flex relative w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 justify-center flex-col border transition-all hover:border-sky-300 box-border"
                    >
                      <p className="text-sm font-light text-gray-700 pb-1">
                        {item.category_product}
                      </p>

                      <div className="flex flex-col">
                        <h3 className="text-gray-700 border-t border-gray-500 text-sm font-semibold pb-2 pt-1">
                          {formatRupiah(item.total_price_category)}
                        </h3>

                        <h3 className="text-gray-700 font-bold text-2xl">
                          {item.total_category.toLocaleString()}
                        </h3>
                      </div>

                      <p className="absolute text-end text-[70px] font-bold -bottom-5 right-2 text-gray-300/30 z-0">
                        {i + 1}
                      </p>
                    </div>
                  ))
              ) : (
                <div className="w-full flex justify-center col-span-4 items-center px-5 py-10 border-b border-sky-200">
                  <div className="w-full flex-none text-center font-semibold">
                    No Data Viewed.
                  </div>
                </div>
              )
            ) : (
              dataChart.map((item: any, i: number) => (
                <div
                  key={item.category_product + i}
                  className="flex w-full relative bg-white rounded-md overflow-hidden shadow px-5 py-3 justify-center flex-col border transition-all hover:border-sky-300 box-border"
                >
                  <p className="text-sm font-light text-gray-700 pb-1">
                    {item.category_product}
                  </p>

                  <div className="flex flex-col">
                    <h3 className="text-gray-700 border-t border-gray-500 text-sm font-semibold pb-2 pt-1">
                      {formatRupiah(item.total_price_category)}
                    </h3>

                    <h3 className="text-gray-700 font-bold text-2xl">
                      {item.total_category.toLocaleString()}
                    </h3>
                  </div>

                  <p className="absolute text-end text-[70px] font-bold -bottom-5 right-2 text-gray-300/30 z-0">
                    {i + 1}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            {searchValue ? (
              <DataTable
                columns={columnsStorage}
                data={
                  dataChart.filter((item: any) =>
                    item.category_product
                      .toLowerCase()
                      .includes(searchValue.toLowerCase()),
                  ) ?? []
                }
              />
            ) : (
              <DataTable columns={columnsStorage} data={dataChart ?? []} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, qty, price }: any) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-lg font-bold">{formatRupiah(price)}</p>
        <p className="text-xs text-gray-500">qty: {qty}</p>
      </CardContent>
    </Card>
  );
}
