import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Boxes,
  Loader2,
  LucideIcon,
  Pencil,
  Printer,
  ReceiptText,
  Shield,
  Trash2,
  XCircle,
  BookMarked,
} from "lucide-react";
import Link from "next/link";
import { MouseEvent } from "react";

const ButtonAction = ({
  isLoading,
  label,
  onClick,
  type,
  icon: Icon,
}: {
  isLoading: boolean;
  label: string;
  onClick: (e: MouseEvent) => void;
  type: "red" | "yellow" | "sky";
  icon: LucideIcon;
}) => {
  const colorMap = {
    red: "border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:hover:bg-red-50",
    yellow:
      "border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:hover:bg-yellow-50",
    sky: "border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:hover:bg-sky-50",
  };

  return (
    <TooltipProviderPage value={label}>
      <Button
        className={cn(
          "items-center p-0 w-9 disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed",
          colorMap[type],
        )}
        disabled={isLoading}
        variant={"outline"}
        type="button"
        onClick={onClick}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </Button>
    </TooltipProviderPage>
  );
};

export const columnProductStaging = ({
  metaPageProduct,
  isLoading,
  // handleAddFilter,
  // handleDryScrap,
  // handleMigrateToRepair,
  // isPendingMigrateToRepair,
  setProductId,
  setIsOpen,
  // isPendingDryScrap,
  setIsOpenDamaged,
  setDamagedProductId,
  setDamagedBarcode,
  setSource,
}: any): ColumnDef<any>[] => [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPageProduct.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "new_barcode_product||old_barcode_product",
    header: "Barcode",
    cell: ({ row }) =>
      row.original.new_barcode_product ??
      row.original.old_barcode_product ??
      "-",
  },
  {
    accessorKey: "new_name_product",
    header: () => <div className="text-center">Product Name</div>,
    cell: ({ row }) => (
      <div className="max-w-[300px] break-all">
        {row.original.new_name_product}
      </div>
    ),
  },
  {
    accessorKey: "new_category_product||new_tag_product",
    header: "Category",
    cell: ({ row }) =>
      row.original.new_category_product ?? row.original.new_tag_product ?? "-",
  },
  {
    accessorKey: "new_price_product||old_price_product",
    header: "Price",
    cell: ({ row }) => (
      <div className="tabular-nums">
        {formatRupiah(
          row.original.new_price_product ?? row.original.old_price_product,
        )}
      </div>
    ),
  },
  {
    accessorKey: "new_date_in_product",
    header: "Input Date",
    cell: ({ row }) => (
      <div className="tabular-nums">
        {format(new Date(row.original.new_date_in_product), "iii, dd MMM yyyy")}
      </div>
    ),
  },
  {
    accessorKey: "new_status_product",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.new_status_product;
      return (
        <Badge
          className={cn(
            "shadow-none font-normal rounded-full capitalize text-black",
            status === "display" && "bg-green-400/80 hover:bg-green-400/80",
            status === "expired" && "bg-red-400/80 hover:bg-red-400/80",
            status === "slow_moving" &&
              "bg-yellow-400/80 hover:bg-yellow-400/80",
          )}
        >
          {status}
        </Badge>
      );
    },
  },
  // {
  //   accessorKey: "status_so",
  //   header: "Status SO",
  //   cell: ({ row }) => {
  //     const status = row.original.status_so;
  //     return (
  //       <Badge
  //         className={cn(
  //           "shadow-none font-normal rounded-full capitalize text-black",
  //           status === "Sudah SO" && "bg-green-400/80 hover:bg-green-400/80",
  //           status === "Belum SO" && "bg-red-400/80 hover:bg-red-400/80",
  //         )}
  //       >
  //         {status}
  //       </Badge>
  //     );
  //   },
  // },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        {/* <ButtonAction
          icon={PlusCircle}
          isLoading={isLoading}
          type="sky"
          onClick={(e) => {
            e.preventDefault();
            handleAddFilter(row.original.id);
          }}
          label="Add to Filter"
        /> */}
        <ButtonAction
          icon={ReceiptText}
          isLoading={isLoading}
          type="yellow"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen("detail");
            setProductId(row.original.id);
          }}
          label="Detail"
        />
        <ButtonAction
          label="Damaged"
          onClick={(e) => {
            e.preventDefault();
            setDamagedProductId(row.original.id);
            setDamagedBarcode(
              row.original.new_barcode_product ??
                row.original.old_barcode_product ??
                "-",
            );
            setSource(row.original.source ?? "");
            setIsOpenDamaged(true);
          }}
          isLoading={isLoading}
          icon={Shield}
          type="red"
        />
        {/* <Popover>
          <TooltipProviderPage value={<p>Migrate To Repair / Dry Scrap</p>}>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "items-center p-0 w-9 disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed",
                  "border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:hover:bg-red-50"
                )}
                variant={"outline"}
                type="button"
              >
                <Drill className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
          </TooltipProviderPage>

          <PopoverContent className="w-auto py-2">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="justify-start px-3 text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  setProductId(row.original.id);
                  setIsOpen("lpr");
                }}
              >
                To LPR
              </Button>
              <Button
                variant="ghost"
                className="justify-start px-3 text-sm"
                onClick={() => {
                  handleMigrateToRepair(row.original.id);
                }}
                disabled={isPendingMigrateToRepair}
              >
                Migrate to Repair
              </Button>
              <Button
                variant="ghost"
                className="justify-start px-3 text-sm"
                onClick={() => {
                  handleDryScrap(row.original.id);
                }}
                disabled={isPendingDryScrap}
              >
                Dry Scrap
              </Button>
            </div>
          </PopoverContent>
        </Popover> */}
      </div>
    ),
  },
];

export const columnFilteredProductStaging = ({
  metaPage,
  isLoading,
  handleRemoveFilter,
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
    accessorKey: "new_barcode_product||old_barcode_product",
    header: "Barcode",
    cell: ({ row }) =>
      row.original.new_barcode_product ??
      row.original.old_barcode_product ??
      "-",
  },
  {
    accessorKey: "new_name_product",
    header: "Product Name",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original.new_name_product}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <ButtonAction
          label="Delete"
          onClick={(e) => {
            e.preventDefault();
            handleRemoveFilter(row.original.id);
          }}
          isLoading={isLoading}
          icon={XCircle}
          type="red"
        />
      </div>
    ),
  },
];

export const columnHistoryRackStaging = ({
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
    accessorKey: "rack_name",
    header: "Rack Name",
    cell: ({ row }) => row.original.rack_name ?? "-",
  },
  {
    accessorKey: "total_in_rack",
    header: "Total in Rack",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original.total_in_rack}
      </div>
    ),
  },
  {
    accessorKey: "users",
    header: "User & Total Input",
    cell: ({ row }) => {
      const users = row.original.users;

      if (!users || users.length === 0) return <span>-</span>;

      return (
        <div className="max-w-[500px] break-all">
          {users
            .map((user: any) => `${user.user_name} (${user.total_inserted})`)
            .join(", ")}
        </div>
      );
    },
  },
];

export const columnRackStaging = ({
  metaPage,
  isLoading,
  setRackId,
  setInput,
  handleDelete,
  handleSubmit,
  setIsOpen,
  setSelectedBarcode,
  setSelectedNameRack,
  setSelectedTotalProduct,
  setBarcodeOpen,
  handleStockOpname,
  isPendingStockOpname,
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
    accessorKey: "new_barcode_product||old_barcode_product",
    header: "Barcode",
    cell: ({ row }) => row.original.barcode ?? "-",
  },
  {
    accessorKey: "name",
    header: "Name Rack",
    cell: ({ row }) => (
      <div className="max-w-[300px] break-all">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "total_data",
    header: "Total Data",
    cell: ({ row }) => row.original.total_data ?? "-",
  },
  {
    accessorKey: "total_old_price_product",
    header: "Old Price",
    cell: ({ row }) => (
      <div className="tabular-nums">
        {formatRupiah(row.original.total_old_price_product ?? 0)}
      </div>
    ),
  },
  // {
  //   accessorKey: "status_so",
  //   header: "Status SO",
  //   cell: ({ row }) => {
  //     const status = row.original.status_so;
  //     return (
  //       <Badge
  //         className={cn(
  //           "shadow-none font-normal rounded-full capitalize text-black",
  //           status === "Sudah SO" && "bg-green-400/80 hover:bg-green-400/80",
  //           status === "Belum SO" && "bg-red-400/80 hover:bg-red-400/80",
  //         )}
  //       >
  //         {status}
  //       </Badge>
  //     );
  //   },
  // },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <Link href={`/stagging/rack/details/${row.original.id}`}>
          <ButtonAction
            icon={ReceiptText}
            type="sky"
            label="Detail"
            isLoading={false}
            onClick={() => {}}
          />
        </Link>
        <ButtonAction
          icon={Pencil}
          isLoading={isLoading}
          type="yellow"
          onClick={(e) => {
            e.preventDefault();
            setRackId(row.original.id);
            setInput((prev: any) => ({
              ...prev,
              displayId:
                row.original.display_rack_id ?? row.original.display?.id ?? "",
              display: {
                id:
                  row.original.display_rack_id ??
                  row.original.display?.id ??
                  "",
                name: row.original.display?.name ?? row.original.name ?? "",
              },
              name: row.original.name ?? prev.name,
            }));
            setIsOpen("create-edit");
          }}
          label="Edit Rack"
        />
        <ButtonAction
          label="Print QR"
          onClick={(e) => {
            e.preventDefault();
            setSelectedBarcode(row.original.barcode);
            setSelectedNameRack(row.original.name);
            setSelectedTotalProduct(row.original.total_data);
            setBarcodeOpen(true);
          }}
          isLoading={false}
          icon={Printer}
          type="sky"
        />

        <ButtonAction
          label="Delete"
          onClick={(e) => {
            e.preventDefault();
            handleDelete(row.original.id);
          }}
          isLoading={isLoading}
          icon={Trash2}
          type="red"
        />
        <ButtonAction
          label="To Display"
          onClick={(e) => {
            e.preventDefault();
            handleSubmit(row.original.id);
          }}
          isLoading={isLoading}
          icon={Boxes}
          type="sky"
        />
        <ButtonAction
          label="Stock Opname"
          onClick={(e) => {
            e.preventDefault();
            handleStockOpname(row.original.id);
          }}
          isLoading={isPendingStockOpname}
          icon={BookMarked}
          type="yellow"
        />
      </div>
    ),
  },
];
