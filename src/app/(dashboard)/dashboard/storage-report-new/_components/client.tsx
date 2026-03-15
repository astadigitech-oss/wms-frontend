// "use client";

// import React, { MouseEvent, useEffect, useMemo, useState } from "react";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";

// import { cn, formatRupiah } from "@/lib/utils";
// import { useGetStorageReport } from "../_api/use-get-storage-report";
// import { DataTable } from "@/components/data-table";
// import { Label } from "@/components/ui/label";
// import { LayoutGrid, LayoutList, Search, X } from "lucide-react";
// import { ColumnDef } from "@tanstack/react-table";
// import { useQueryState } from "nuqs";
// import { useDebounce } from "@/hooks/use-debounce";
// import Loading from "@/app/(dashboard)/loading";
// import { AxiosError } from "axios";
// import Forbidden from "@/components/403";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";

// interface ChartData {
//   category_product: string;
//   total_category: number;
//   total_price_category: string;
//   days_since_created: string;
// }

// const DONUT_COLORS = {
//   dump: "#ef4444", // merah
//   scrap: "#6b7280", // abu
// };

// export const columnsStorage: ColumnDef<any>[] = [
//   {
//     header: () => <div className="text-center">No</div>,
//     id: "id",
//     cell: ({ row }) => (
//       <div className="text-center tabular-nums">
//         {(row.index + 1).toLocaleString()}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "category_product",
//     header: "Category Name",
//     cell: ({ row }) => (
//       <div className="break-all max-w-[500px]">
//         {row.original.category_product}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "total_category",
//     header: () => <div className="text-center">Total Product</div>,
//     cell: ({ row }) => (
//       <div className="text-center tabular-nums">
//         {row.original.total_category}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "total_price_category",
//     header: "Value Product",
//     cell: ({ row }) => {
//       const formated = formatRupiah(row.original.total_price_category);
//       return <div className="tabular-nums">{formated}</div>;
//     },
//   },
// ];

// export default function Client() {
//   const [isMounted, setIsMounted] = useState(false);
//   const [dataSearch, setDataSearch] = useQueryState("q", {
//     defaultValue: "",
//   });
//   const searchValue = useDebounce(dataSearch);
//   const [layout, setLayout] = useQueryState("layout", {
//     defaultValue: "list",
//   });
//   const { data, isPending, isRefetching, isLoading, isError, error } =
//       useGetStorageReport();
//   const resource = useMemo(() => {
//     return data?.data.data.resource;
//   }, [data]);

//   const loading = isLoading || isRefetching || isPending;
//   /* =============================
//      TRANSFORM CHART DATA
//   ==============================*/
//   const dataChart: ChartData[] = useMemo(() => {
//     return data?.data.data.resource.chart.category;
//   }, [data]);

//   const chartData = useMemo(() => {
//     if (!resource) return [];

//     const display = resource.chart.category;
//     const staging = resource.chart_staging.category;
//     const b2b = resource.chart_b2b.category;
//     const dump = resource.chart_dump.category;
//     const scrap = resource.chart_scrap_qcd.category;

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
//   }, [resource]);

//   /* =============================
//      DONUT DATA
//   ==============================*/

//   const donutData = [
//     {
//       name: "Dump",
//       value: resource?.total_product_dump || 0,
//       color: DONUT_COLORS.dump,
//     },
//     {
//       name: "Scrap",
//       value: resource?.total_product_scrap_qcd || 0,
//       color: DONUT_COLORS.scrap,
//     },
//   ];

//   const clearSearch = (e: MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     setDataSearch("");
//   };

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   if (!isMounted) {
//     return <Loading />;
//   }

//   if (isError && (error as AxiosError).status === 403) {
//     return (
//       <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
//         <Forbidden />
//       </div>
//     );
//   }

//   if (!resource) return null;

//   return (
//     <div className="flex flex-col gap-6 p-6 bg-gray-100">
//       <Breadcrumb>
//         <BreadcrumbList>
//           <BreadcrumbItem>
//             <BreadcrumbLink href="/">Home</BreadcrumbLink>
//           </BreadcrumbItem>
//           <BreadcrumbSeparator />
//           <BreadcrumbItem>Dashboard</BreadcrumbItem>
//           <BreadcrumbSeparator />
//           <BreadcrumbItem>Storage Report</BreadcrumbItem>
//         </BreadcrumbList>
//       </Breadcrumb>
//       {/* =============================
//            TOTAL PRODUCT
//       ============================== */}

//       <Card>
//         <CardHeader>
//           <CardTitle>Total all produk</CardTitle>
//         </CardHeader>

//         {loading ? (
//           <div className="h-[320px] w-full animate-pulse bg-gray-200 rounded" />
//         ) : (
//           <CardContent className="grid grid-cols-2 gap-6">
//             <div>
//               <div className="flex justify-between text-sm">
//                 <span>Total Product</span>
//                 <span>{resource.total_all_product}</span>
//               </div>

//               <Progress value={resource.total_percentage_product} />
//             </div>

//             <div>
//               <div className="flex justify-between text-sm">
//                 <span>Total Value</span>
//                 <span>{formatRupiah(resource.total_all_price)}</span>
//               </div>

//               <Progress value={resource.total_percentage_price} />
//             </div>
//           </CardContent>
//         )}
//       </Card>

//       {/* =============================
//            SUMMARY CARD
//       ============================== */}

//       <div className="grid grid-cols-4 gap-4">
//         <SummaryCard
//           title="Produk Staging"
//           qty={resource.total_product_staging}
//           price={resource.total_product_staging_price}
//         />

//         <SummaryCard
//           title="Produk Display"
//           qty={resource.total_product_display}
//           price={resource.total_product_display_price}
//         />

//         <SummaryCard
//           title="Produk SKU"
//           qty={resource.total_product_sku}
//           price={resource.total_product_sku_price}
//         />

//         <SummaryCard
//           title="Produk B2B"
//           qty={resource.total_product_b2b}
//           price={resource.total_product_b2b_price}
//         />
//       </div>

//       {/* =============================
//            COLOR + DONUT
//       ============================== */}

//       <div className="grid grid-cols-3 gap-4">
//         {/* COLOR LIST */}

//         <Card className="col-span-2">
//           <CardHeader>
//             <CardTitle>Produk Color</CardTitle>
//           </CardHeader>

//           <CardContent className="flex flex-col gap-4">
//             {resource.tag_products.color.map((item: any) => (
//               <div key={item.tag_product}>
//                 <div className="flex justify-between text-sm">
//                   <span>{item.tag_product}</span>
//                   <span>{item.total_tag_product} produk</span>
//                 </div>

//                 <Progress value={item.percentage_tag_product} />

//                 <div className="text-right text-xs text-gray-500">
//                   {formatRupiah(item.total_price_tag_product)}
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//         </Card>

//         {/* DONUT */}

//         <Card>
//           <CardHeader>
//             <CardTitle>Produk Dump dan Scrap</CardTitle>
//           </CardHeader>

//           <CardContent className="flex flex-col items-center gap-4">
//             <PieChart width={220} height={220}>
//               <Pie
//                 data={donutData}
//                 innerRadius={60}
//                 outerRadius={90}
//                 dataKey="value"
//               >
//                 {donutData.map((entry, index) => (
//                   <Cell key={index} fill={entry.color} />
//                 ))}
//               </Pie>
//             </PieChart>

//             {/* Legend */}
//             <div className="flex gap-6 text-sm">
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
//                 <span>Dump ({resource.total_product_dump})</span>
//               </div>

//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full bg-gray-500"></div>
//                 <span>Scrap ({resource.total_product_scrap_qcd})</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* =============================
//            LINE CHART
//       ============================== */}

//       <Card>
//         <CardHeader>
//           <CardTitle>Produk category</CardTitle>
//         </CardHeader>

//         <CardContent>
//           <div className="h-[320px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" />

//                 <XAxis dataKey="category" />

//                 <YAxis />

//                 <Tooltip />

//                 <Line
//                   type="monotone"
//                   dataKey="display"
//                   stroke="#16a34a"
//                   strokeWidth={3}
//                 />

//                 <Line
//                   type="monotone"
//                   dataKey="staging"
//                   stroke="#000"
//                   strokeWidth={3}
//                 />

//                 <Line
//                   type="monotone"
//                   dataKey="b2b"
//                   stroke="#3b82f6"
//                   strokeWidth={3}
//                 />

//                 <Line
//                   type="monotone"
//                   dataKey="dump"
//                   stroke="#ef4444"
//                   strokeWidth={3}
//                 />

//                 <Line
//                   type="monotone"
//                   dataKey="scrap"
//                   stroke="#6b7280"
//                   strokeWidth={3}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>

//       {/* =============================
//            TABLE
//       ============================== */}
//       <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 items-center flex-col">
//         <div className="w-full flex flex-col gap-4">
//           <h3 className="text-lg font-semibold">List Product Per-Category</h3>

//           <div className="w-full flex justify-between items-center">
//             <div className="flex items-center gap-5" style={{ width: "60%" }}>
//               <div className="relative w-full flex items-center mb-0">
//                 <Label className="absolute left-3" htmlFor="search">
//                   <Search className="w-4 h-4" />
//                 </Label>

//                 <input
//                   id="search"
//                   value={dataSearch}
//                   onChange={(e) => setDataSearch(e.target.value)}
//                   className="w-full h-9 rounded outline-none px-10 text-xs border border-gray-500"
//                 />

//                 <button
//                   onClick={clearSearch}
//                   className={cn(
//                     "h-5 w-5 absolute right-2 items-center justify-center outline-none",
//                     dataSearch.length > 0 ? "flex" : "hidden",
//                   )}
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>

//               <div className="flex border border-gray-500 rounded flex-none h-9 overflow-hidden">
//                 <button
//                   className={cn(
//                     "w-9 h-full flex items-center justify-center outline-none",
//                     layout === "list" ? "bg-sky-300" : "bg-transparent",
//                   )}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     e.preventDefault();
//                     setLayout("list");
//                   }}
//                 >
//                   <LayoutList className="w-4 h-4" />
//                 </button>

//                 <button
//                   className={cn(
//                     "w-9 h-full flex items-center justify-center outline-none",
//                     layout === "grid" ? "bg-sky-300" : "bg-transparent",
//                   )}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     e.preventDefault();
//                     setLayout("grid");
//                   }}
//                 >
//                   <LayoutGrid className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>

//             {/* <Button
//               onClick={(e) => {
//                 e.preventDefault();
//                 handleExport();
//               }}
//               className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
//               disabled={isPendingExport}
//               variant={"outline"}
//             >
//               {isPendingExport ? (
//                 <Loader2 className={"w-4 h-4 mr-1 animate-spin"} />
//               ) : (
//                 <FileDown className={"w-4 h-4 mr-1"} />
//               )}
//               Export Data
//             </Button> */}
//           </div>
//         </div>

//         {layout === "grid" ? (
//           <div className="grid grid-cols-4 gap-4 w-full">
//             {searchValue ? (
//               dataChart.filter((item: any) =>
//                 item.category_product
//                   .toLowerCase()
//                   .includes(searchValue.toLowerCase()),
//               ).length > 0 ? (
//                 dataChart
//                   .filter((item: any) =>
//                     item.category_product
//                       .toLowerCase()
//                       .includes(searchValue.toLowerCase()),
//                   )
//                   .map((item: any, i: number) => (
//                     <div
//                       key={item.category_product + i}
//                       className="flex relative w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 justify-center flex-col border transition-all hover:border-sky-300 box-border"
//                     >
//                       <p className="text-sm font-light text-gray-700 pb-1">
//                         {item.category_product}
//                       </p>

//                       <div className="flex flex-col">
//                         <h3 className="text-gray-700 border-t border-gray-500 text-sm font-semibold pb-2 pt-1">
//                           {formatRupiah(item.total_price_category)}
//                         </h3>

//                         <h3 className="text-gray-700 font-bold text-2xl">
//                           {item.total_category.toLocaleString()}
//                         </h3>
//                       </div>

//                       <p className="absolute text-end text-[70px] font-bold -bottom-5 right-2 text-gray-300/30 z-0">
//                         {i + 1}
//                       </p>
//                     </div>
//                   ))
//               ) : (
//                 <div className="w-full flex justify-center col-span-4 items-center px-5 py-10 border-b border-sky-200">
//                   <div className="w-full flex-none text-center font-semibold">
//                     No Data Viewed.
//                   </div>
//                 </div>
//               )
//             ) : (
//               dataChart.map((item: any, i: number) => (
//                 <div
//                   key={item.category_product + i}
//                   className="flex w-full relative bg-white rounded-md overflow-hidden shadow px-5 py-3 justify-center flex-col border transition-all hover:border-sky-300 box-border"
//                 >
//                   <p className="text-sm font-light text-gray-700 pb-1">
//                     {item.category_product}
//                   </p>

//                   <div className="flex flex-col">
//                     <h3 className="text-gray-700 border-t border-gray-500 text-sm font-semibold pb-2 pt-1">
//                       {formatRupiah(item.total_price_category)}
//                     </h3>

//                     <h3 className="text-gray-700 font-bold text-2xl">
//                       {item.total_category.toLocaleString()}
//                     </h3>
//                   </div>

//                   <p className="absolute text-end text-[70px] font-bold -bottom-5 right-2 text-gray-300/30 z-0">
//                     {i + 1}
//                   </p>
//                 </div>
//               ))
//             )}
//           </div>
//         ) : (
//           <div className="flex flex-col gap-2 w-full">
//             {searchValue ? (
//               <DataTable
//                 columns={columnsStorage}
//                 data={
//                   dataChart.filter((item: any) =>
//                     item.category_product
//                       .toLowerCase()
//                       .includes(searchValue.toLowerCase()),
//                   ) ?? []
//                 }
//               />
//             ) : (
//               <DataTable columns={columnsStorage} data={dataChart ?? []} />
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* =============================
//    SUMMARY CARD COMPONENT
// ==============================*/

// function SummaryCard({ title, qty, price }: any) {
//   return (
//     <Card>
//       <CardContent className="p-4">
//         <p className="text-sm text-gray-500">{title}</p>

//         <p className="text-lg font-bold">{formatRupiah(price)}</p>

//         <p className="text-xs text-gray-500">qty: {qty}</p>
//       </CardContent>
//     </Card>
//   );
// }


"use client";

import React, { useEffect, useMemo, useState } from "react";
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

import { formatRupiah } from "@/lib/utils";
import { useGetStorageReport } from "../_api/use-get-storage-report";
import { DataTable } from "@/components/data-table";
// import { Label } from "@/components/ui/label";
// import { LayoutGrid, LayoutList, Search, X } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
// import { useQueryState } from "nuqs";
// import { useDebounce } from "@/hooks/use-debounce";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

  // const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  // const searchValue = useDebounce(dataSearch);

  // const [layout, setLayout] = useQueryState("layout", { defaultValue: "list" });

  const { data, isLoading, isPending, isRefetching, isError, error } =
    useGetStorageReport();

  const loading = isLoading || isPending || isRefetching;

  const resource = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataChart: ChartData[] = useMemo(() => {
    return data?.data.data.resource.chart.category ?? [];
  }, [data]);

  const chartData = useMemo(() => {
    if (!resource) return [];

    const display = resource.chart.category;
    const staging = resource.chart_staging.category;
    const b2b = resource.chart_b2b.category;
    const dump = resource.chart_dump.category;
    const scrap = resource.chart_scrap_qcd.category;

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
  }, [resource]);

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

  // const clearSearch = (e: MouseEvent<HTMLButtonElement>) => {
  //   e.preventDefault();
  //   setDataSearch("");
  // };

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
            ].map((item, i) => (
              <SummaryCard key={i} {...item} />
            ))}
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
                  <div key={i} className="h-8 bg-gray-200 animate-pulse rounded" />
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
                <Pie data={donutData} innerRadius={60} outerRadius={90} dataKey="value">
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
          <CardTitle>Produk category</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[320px]">
            {loading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse rounded" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />

                  <Line type="monotone" dataKey="display" stroke="#16a34a" strokeWidth={3} />
                  <Line type="monotone" dataKey="staging" stroke="#000" strokeWidth={3} />
                  <Line type="monotone" dataKey="b2b" stroke="#3b82f6" strokeWidth={3} />
                  <Line type="monotone" dataKey="dump" stroke="#ef4444" strokeWidth={3} />
                  <Line type="monotone" dataKey="scrap" stroke="#6b7280" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}

      <Card>
        <CardHeader>
          <CardTitle>List Product Per-Category</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <DataTable columns={columnsStorage} data={dataChart ?? []} />
          )}
        </CardContent>
      </Card>
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