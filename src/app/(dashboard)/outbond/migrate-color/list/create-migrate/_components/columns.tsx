import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Loader2, LucideIcon, PlusCircle, Trash2 } from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { MouseEvent } from "react";

export type BKLProduct = {
  id: string;
  barcode: string;
  product_name: string;
  category: string;
  price: number;
};
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

export const columnBKL = ({
  handleRemoveProduct,
  isLoading,
}: {
  handleRemoveProduct: (id: string) => void;
  isLoading: boolean;
}): ColumnDef<BKLProduct>[] => [
  {
    accessorKey: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "barcode",
    header: "Barcode",
    cell: ({ row }) => row.original.barcode,
  },
  {
    accessorKey: "product_name",
    header: "Product Name",
    cell: ({ row }) => row.original.product_name,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => row.original.category,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => formatRupiah(row.original.price),
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleRemoveProduct(row.original.id)}
        disabled={isLoading}
      >
        <Trash2 className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
      </Button>
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
          label={"Add"}
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