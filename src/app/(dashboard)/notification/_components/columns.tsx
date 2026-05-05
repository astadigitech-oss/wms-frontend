import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { cn, formatRupiah } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { MetaPageProps } from "@/lib/pagination";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import { id } from "date-fns/locale";
import { formatDistanceToNowStrict } from "date-fns";
import { ArrowUpRight, CheckCircle2, Loader2, XCircle } from "lucide-react";

interface ColumnNotificationProps {
  metaPage: MetaPageProps;
  setUserId: (value: string | null) => Promise<URLSearchParams>;
  setSaleId: (value: string | null) => Promise<URLSearchParams>;
  setOpenDialog: (value: string | null) => Promise<URLSearchParams>;
  setMiId: (value: string | null) => Promise<URLSearchParams>;
  isLoading: boolean;
}

interface ColumnSalesProps {
  isPending: boolean;
  handleApproveProduct: (id: string) => void;
  handleRejectProduct: (id: string) => void;
}

interface ColumnPaletProps {
  isPending: boolean;
}

const BadgeStatus = ({
  item,
  setSaleId,
  setUserId,
  setMiId,
  setOpenDialog,
  isLoading,
}: any) => {
  if (item.user_id && item.approved === "0" && item.status === "palet") {
    return (
      <Button
        onClick={(e) => {
          e.preventDefault();
          setUserId(item.user_id);
          setOpenDialog(item.status);
        }}
        disabled={isLoading}
        className="text-black bg-sky-400/80 hover:bg-sky-400 h-7 px-3 [&_svg]:size-3 gap-1"
      >
        <p className="text-xs">Check</p>
        {isLoading ? <Loader2 className="animate-spin" /> : <ArrowUpRight />}
      </Button>
    );
  } else if (item.approved === "0" && item.status === "manual_inbound") {
    return (
      <Button
        onClick={(e) => {
          e.preventDefault();
          setMiId(item.id);
          setOpenDialog(item.status);
        }}
        disabled={isLoading}
        className="text-black bg-sky-400/80 hover:bg-sky-400 h-7 px-3 [&_svg]:size-3 gap-1"
      >
        <p className="text-xs">Check</p>
        {isLoading ? <Loader2 className="animate-spin" /> : <ArrowUpRight />}
      </Button>
    );
  } else if (item.approved === "0") {
    return (
      <Button
        onClick={(e) => {
          e.preventDefault();
          setSaleId(item.external_id);
          setOpenDialog(item.status);
        }}
        disabled={isLoading}
        className="text-black bg-sky-400/80 hover:bg-sky-400 h-7 px-3 [&_svg]:size-3 gap-1"
      >
        <p className="text-xs">Check</p>
        {isLoading ? <Loader2 className="animate-spin" /> : <ArrowUpRight />}
      </Button>
    );
  } else if (item.approved === "1") {
    return (
      <Badge className="bg-red-300 hover:bg-red-300 font-normal text-black h-7 px-3 cursor-default">
        Rejected
      </Badge>
    );
  } else if (item.approved === "2") {
    return (
      <Badge className="bg-green-300 hover:bg-green-300 font-normal text-black h-7 px-3 cursor-default">
        Approved
      </Badge>
    );
  }

  return "-";
};

export const columnNotification = ({
  metaPage,
  setSaleId,
  setUserId,
  setMiId,
  setOpenDialog,
  isLoading,
}: ColumnNotificationProps): ColumnDef<any>[] => [
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
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => (
      <div className="flex justify-center my-1.5">
        <Badge
          className={cn(
            "font-normal capitalize text-black shadow-none",
            row.original.status.toLowerCase() === "pending" &&
              "bg-yellow-300 hover:bg-yellow-300",
            row.original.status.toLowerCase() === "display" &&
              "bg-sky-400 hover:bg-sky-400",
            row.original.status.toLowerCase() === "done" &&
              "bg-green-400 hover:bg-green-400",
            row.original.status.toLowerCase() === "sale" &&
              "bg-indigo-400 hover:bg-indigo-400 text-white",
            row.original.status.toLowerCase() === "inventory" &&
              "bg-amber-700 hover:bg-amber-700 text-white",
            row.original.status.toLowerCase() === "staging" &&
              "bg-rose-300 hover:bg-rose-300",
            row.original.status.toLowerCase() === "palet" &&
              "bg-purple-500 hover:bg-purple-500 text-white",
            row.original.status.toLowerCase() === "manual_inbound" &&
              "bg-red-400 hover:bg-red-400 text-white",
          )}
        >
          {row.original.status}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "notification_name",
    header: "Notification",
  },
  {
    accessorKey: "created_at",
    header: "Time",
    cell: ({ row }) =>
      formatDistanceToNowStrict(new Date(row.original.created_at), {
        locale: id,
        addSuffix: true,
      }),
  },
  {
    accessorKey: "external_id",
    header: () => <div className="text-center">Approve</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <BadgeStatus
          item={row.original}
          setSaleId={setSaleId}
          setUserId={setUserId}
          setMiId={setMiId}
          setOpenDialog={setOpenDialog}
          isLoading={isLoading}
        />
      </div>
    ),
  },
];

export const columnSales = ({
  isPending,
  handleApproveProduct,
  handleRejectProduct,
}: ColumnSalesProps): ColumnDef<any>[] => [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(1 + row.index).toLocaleString()}
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
        {row.original?.product_name_sale}
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
      <div className="flex justify-center">
        {row.original.approved === "1" ? (
          <div className="flex gap-2 justify-center items-center my-0.5">
            <TooltipProviderPage value={"Approve"}>
              <Button
                className="size-8 px-0 hover:bg-sky-100 border-sky-400 hover:border-sky-600 text-black"
                size={"icon"}
                variant={"outline"}
                type="button"
                disabled={isPending}
                onClick={(e) => {
                  e.preventDefault();
                  handleApproveProduct(row.original.id);
                }}
              >
                <CheckCircle2 className="size-4" />
              </Button>
            </TooltipProviderPage>
            <TooltipProviderPage value={"Reject"}>
              <Button
                className="size-8 px-0 hover:bg-red-100 border-red-400 hover:border-red-600 text-black"
                size={"icon"}
                variant={"outline"}
                type="button"
                disabled={isPending}
                onClick={(e) => {
                  e.preventDefault();
                  handleRejectProduct(row.original.id);
                }}
              >
                <XCircle className="size-4" />
              </Button>
            </TooltipProviderPage>
          </div>
        ) : (
          <div className="flex gap-2 justify-center items-center my-0.5">
            <Badge className="bg-sky-300 hover:bg-sky-300 font-normal text-black h-7 px-3 cursor-default">
              Approved
            </Badge>
          </div>
        )}
      </div>
    ),
  },
];

export const columnPalet = ({}: ColumnPaletProps): ColumnDef<any>[] => [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(1 + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "palet_barcode",
    header: "Barcode",
  },
  {
    accessorKey: "name_palet",
    header: "Palet Name",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">{row.original?.name_palet}</div>
    ),
  },
  {
    accessorKey: "total_product_palet",
    header: "Total Product",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original?.total_product_palet}
      </div>
    ),
  },
  {
    accessorKey: "total_price_palet",
    header: "Total Price",
    cell: ({ row }) => (
      <div className="tabular-nums">
        {formatRupiah(row.original.total_price_palet)}
      </div>
    ),
  },
];
