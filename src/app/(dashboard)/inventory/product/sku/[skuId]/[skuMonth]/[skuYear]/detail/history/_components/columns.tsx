import { Badge } from "@/components/ui/badge";
import { cn, formatRupiah } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const columnHistoryBundle = ({
  metaPageHistoryBundling,
}: any): ColumnDef<any>[] => [
   {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPageHistoryBundling.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "tanggal",
      header: "Date",
      cell: ({ row }) => {
        const formatted = format(
          new Date(row.original.tanggal),
          "iiii, dd MMMM yyyy",
        );
        return <div className="tabular-nums">{formatted}</div>;
      },
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => row.original.user,
    },
    {
      accessorKey: "produk",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">{row.original.produk}</div>
      ),
    },
    {
      accessorKey: "type_badge",
      header: "Type",
      cell: ({ row }) => (
        // <div className="max-w-[500px] break-all">{row.original.type_badge}</div>
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded w-20 px-0 justify-center font-normal capitalize",
              row.original.type_badge === "bundling"
                ? "bg-green-400 text-black hover:bg-green-400"
                : "bg-yellow-400 text-black hover:bg-yellow-400",
            )}
          >
            {row.original.type_badge}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "price_before",
      header: "Price Before",
      cell: ({ row }) =>
        formatRupiah(Number(row.original.price_before.replace(/,/g, ""))),
    },
    {
      accessorKey: "price_after",
      header: "Price After",
      cell: ({ row }) =>
        formatRupiah(Number(row.original.price_after.replace(/,/g, ""))),
    },

    {
      accessorKey: "qty_before",
      header: "Qty Before",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">{row.original.qty_before}</div>
      ),
    },
    {
      accessorKey: "qty_after",
      header: "Qty After",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">{row.original.qty_after}</div>
      ),
    },
    {
      accessorKey: "items_per_bundle",
      header: "Items /bundle",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.items_per_bundle}
        </div>
      ),
    },
    {
      accessorKey: "bundling",
      header: "Bundling",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">{row.original.bundling}</div>
      ),
    },
];

export const columnHistoryRackColor = ({
  metaPage,
}: any): ColumnDef<any>[] => [
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
    accessorKey: "barcode",
    header: "Barcode",
    cell: ({ row }) => row.original.barcode ?? "-",
  },
  {
    accessorKey: "rack_name",
    header: "Rack Name",
    cell: ({ row }) => row.original.rack_name ?? "-",
  },
    {
    accessorKey: "product_name",
    header: "Product Name",
    cell: ({ row }) => row.original.product_name ?? "-",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original.action}
      </div>
    ),
  },
   {
    accessorKey: "operator",
    header: "user",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original.operator}
      </div>
    ),
  },
];