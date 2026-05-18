"use client";

import { Package, Wallet, TrendingUp, TrendingDown } from "lucide-react";

import { useMemo } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { cn, formatRupiah } from "@/lib/utils";

const dashboardData = {
  breakdown: [
    {
      qty: 39100,
      location: "staging_reguler",
      total_price: 4895238010,
      total_price_before: 9869055028,
    },
    {
      qty: 14565,
      location: "display_reguler",
      total_price: 1976517275,
      total_price_before: 3927646514,
    },
    {
      qty: 16225,
      location: "display_color",
      total_price: 215472000,
      total_price_before: 658211661,
    },
    {
      qty: 47317,
      location: "staging_sku",
      total_price: 1,
      total_price_before: 22699879,
    },
    {
      qty: 168,
      location: "bundle",
      total_price: 2538185,
      total_price_before: 7896166,
    },
  ],

  total_qty: 117375,
  total_price: 7089765470,
  total_price_before: 14485509248,

  as_of: "16 May 2026 16:43",
};

const saldoData = [
  {
    name: "Display Reguler",
    saldo_awal: {
      qty: 14567,
      total_price: 1976682275,
      snapshot_date: "2026-05-15",
      total_price_before: 3927976514,
    },
    saldo_realtime: {
      qty: 14565,
      total_price: 1976517275,
      total_price_before: 3927646514,
    },
  },

  {
    name: "Staging",
    saldo_awal: {
      qty: 39100,
      total_price: 4895238010,
      snapshot_date: "2026-05-15",
      total_price_before: 9869055028,
    },
    saldo_realtime: {
      qty: 39100,
      total_price: 4895238010,
      total_price_before: 9869055028,
    },
  },

  {
    name: "Display Color",
    saldo_awal: {
      qty: 16225,
      total_price: 215472000,
      snapshot_date: "2026-05-15",
      total_price_before: 658211661,
    },
    saldo_realtime: {
      qty: 16225,
      total_price: 215472000,
      total_price_before: 658211661,
    },
  },
];

export const Client = () => {
  const summaryCards = [
    {
      title: "Total Quantity",
      value: dashboardData.total_qty.toLocaleString(),
      icon: Package,
    },

    {
      title: "Sale Price",
      value: formatRupiah(dashboardData.total_price),
      icon: Wallet,
    },

    {
      title: "Original Price",
      value: formatRupiah(dashboardData.total_price_before),
      icon: TrendingUp,
    },
  ];

  const chartData = useMemo(() => {
    return dashboardData.breakdown.map((item) => ({
      name: item.location
        .replaceAll("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),

      qty: item.qty,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* HEADER */}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Summary Report</h1>

          <p className="text-gray-500 mt-1">
            Last Update : {dashboardData.as_of}
          </p>
        </div>
      </div>

      {/* KPI */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {summaryCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="
              rounded-3xl
              bg-gradient-to-br
              from-sky-400
              to-blue-600
              text-white
              p-6
              shadow-lg
              "
            >
              <div className="flex justify-between">
                <div>
                  <p className="opacity-80">{item.title}</p>

                  <h1 className="text-3xl font-bold mt-3">{item.value}</h1>
                </div>

                <div
                  className="
                  h-12
                  w-12
                  rounded-full
                  bg-white/20
                  flex
                  items-center
                  justify-center
                  "
                >
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CHART */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <div
          className="
          xl:col-span-2
          rounded-3xl
          bg-white
          p-6
          shadow
          "
        >
          <h2 className="font-bold text-xl mb-6">Inventory Breakdown</h2>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" tick={{ fontSize: 12 }} />

              <YAxis />

              <Tooltip />

              <Bar dataKey="qty" fill="#38bdf8" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* LOCATION CARD */}

        <div
          className="
          rounded-3xl
          bg-white
          p-6
          shadow
          "
        >
          <h2 className="font-bold text-xl mb-6">Location Summary</h2>

          <div className="space-y-5">
            {dashboardData.breakdown.map((item) => (
              <div key={item.location}>
                <div
                  className="
                flex
                justify-between
                mb-2"
                >
                  <span className="capitalize">
                    {item.location.replaceAll("_", " ")}
                  </span>

                  <span
                    className="
                    font-semibold"
                  >
                    {item.qty}
                  </span>
                </div>

                <div
                  className="
                  h-2
                  bg-gray-100
                  rounded-full
                  overflow-hidden"
                >
                  <div
                    className="
                    h-full
                    bg-sky-400"
                    style={{
                      width: `${(item.qty / dashboardData.total_qty) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SALDO SECTION */}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-5">Saldo Realtime</h2>

        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-6"
        >
          {saldoData.map((item) => {
            const diff = item.saldo_realtime.qty - item.saldo_awal.qty;

            return (
              <div
                key={item.name}
                className="
                bg-white
                rounded-3xl
                p-6
                shadow"
              >
                <div
                  className="
                flex
                justify-between"
                >
                  <h3
                    className="
                  font-bold
                  text-lg"
                  >
                    {item.name}
                  </h3>

                  {diff >= 0 ? (
                    <TrendingUp
                      className="
                      text-green-500"
                    />
                  ) : (
                    <TrendingDown
                      className="
                      text-red-500"
                    />
                  )}
                </div>

                <div
                  className="
                mt-5
                space-y-3"
                >
                  <div>
                    <p
                      className="
                    text-sm
                    text-gray-500"
                    >
                      Saldo Awal
                    </p>

                    <h3
                      className="
                    font-semibold"
                    >
                      Qty : {item.saldo_awal.qty}
                    </h3>
                    <h3
                      className="
                    font-semibold"
                    >
                      total price before :{" "}
                      {formatRupiah(item.saldo_awal.total_price_before)}
                    </h3>
                    <h3
                      className="
                    font-semibold"
                    >
                      total price : {formatRupiah(item.saldo_awal.total_price)}
                    </h3>
                  </div>

                  <div>
                    <p
                      className="
                    text-sm
                    text-gray-500"
                    >
                      Realtime
                    </p>

                    <h3
                      className="
                    font-semibold"
                    >
                      Qty : {item.saldo_realtime.qty}
                    </h3>
                    <h3
                      className="
                    font-semibold"
                    >
                      total price before :{" "}
                      {formatRupiah(item.saldo_awal.total_price_before)}
                    </h3>
                    <h3
                      className="
                    font-semibold"
                    >
                      total price : {formatRupiah(item.saldo_awal.total_price)}
                    </h3>
                  </div>

                  <div
                    className={cn(
                      "font-bold",

                      diff >= 0 ? "text-green-500" : "text-red-500",
                    )}
                  >
                    Difference : {diff > 0 ? "+" : ""}
                    {diff}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
