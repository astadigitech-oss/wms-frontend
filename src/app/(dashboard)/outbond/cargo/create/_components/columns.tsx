import { cn, formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import {
  CheckCircle2,
  Loader2,
  LucideIcon,
  PlusCircle,
  XCircle,
} from "lucide-react";
import { MouseEvent } from "react";
import { ColumnDef } from "@tanstack/react-table";

interface ButtonActionProps {
  isLoading: boolean;
  label: string;
  onClick: (e: MouseEvent) => void;
  type: "red" | "yellow" | "sky";
  icon: LucideIcon;
  size?: "default" | "sm" | "lg" | "icon" | null;
}

const ButtonAction = ({
  isLoading,
  label,
  onClick,
  type,
  icon: Icon,
  size = "default",
}: ButtonActionProps) => {
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
        size={size}
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

export const columnProductCargo = ({
  handleRemoveProduct,
  isLoading,
}: any): ColumnDef<any>[] => [
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
    accessorKey: "barcode_bulky_sale",
    header: "Barcode",
  },
  {
    accessorKey: "name_product_bulky_sale",
    header: "Product Name",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">
        {row.original.name_product_bulky_sale}
      </div>
    ),
  },
  {
    accessorKey: "old_price_bulky_sale",
    header: "Price",
    cell: ({ row }) => (
      <div className="tabular-nums">
        {formatRupiah(row.original.old_price_bulky_sale)}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <ButtonAction
          isLoading={isLoading}
          label={"Remove"}
          onClick={(e) => {
            e.preventDefault();
            handleRemoveProduct(row.original.id);
          }}
          type={"red"}
          icon={XCircle}
        />
      </div>
    ),
  },
];

export const columnProducts = ({
  metaPage,
  handleAddProduct,
  isLoading,
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
  },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => (
      <div className="max-w-[500px] break-all">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <ButtonAction
          isLoading={isLoading}
          label={"Remove"}
          onClick={(e) => {
            e.preventDefault();
            handleAddProduct({
              type: "product",
              barcode: row.original.barcode,
            });
          }}
          type={"sky"}
          icon={PlusCircle}
        />
      </div>
    ),
  },
];

export const columnBuyer = ({
  metaPage,
  setAdd,
  onClose,
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
    accessorKey: "name_buyer",
    header: "Buyer Name",
    cell: ({ row }) => (
      <div className="max-w-[500px]">{row.original.name_buyer}</div>
    ),
  },
  {
    accessorKey: "phone_buyer",
    header: "No. Hp",
  },
  {
    accessorKey: "address_buyer",
    header: "Address",
    cell: ({ row }) => (
      <div className="max-w-[500px]">{row.original.address_buyer}</div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <ButtonAction
          isLoading={false}
          label={"Remove"}
          onClick={(e) => {
            e.preventDefault();
            setAdd((prev: any) => ({
              ...prev,
              category_id: row.original.id,
              name_buyer: row.original.name_buyer,
            }));
            onClose();
          }}
          type={"sky"}
          icon={CheckCircle2}
        />
      </div>
    ),
  },
];

export const columnCategory = ({
  setAdd,
  onClose,
}: any): ColumnDef<any>[] => [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(row.index + 1).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "name_category",
    header: "Category Name",
    cell: ({ row }) => (
      <div className="max-w-[500px]">{row.original.name_category}</div>
    ),
  },
  {
    accessorKey: "discount_category",
    header: "Discount",
  },
  {
    accessorKey: "max_price_category",
    header: "Max Price",
    cell: ({ row }) => (
      <div className="max-w-[500px]">
        {formatRupiah(row.original.max_price_category)}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex gap-4 justify-center items-center">
        <ButtonAction
          isLoading={false}
          label={"Remove"}
          onClick={(e) => {
            e.preventDefault();
            setAdd((prev: any) => ({
              ...prev,
              category_id: row.original.id,
              name_category: row.original.name_category,
            }));
            onClose();
          }}
          type={"sky"}
          icon={CheckCircle2}
        />
      </div>
    ),
  },
];
