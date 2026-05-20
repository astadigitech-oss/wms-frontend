import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import HistoryComparisonDialog from "./dialog-detail";


export const columnHistory = ({
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
    accessorKey: "barcode_produk",
    header: "Barcode Product",
    cell: ({ row }) => row.original.barcode_produk ?? "-",
  },

  {
    accessorKey: "time_request",
    header: "Time Request",
    cell: ({ row }) => row.original.time_request ?? "-",
  },

  {
    accessorKey: "user_request",
    header: "User Request",
    cell: ({ row }) => row.original.user_request ?? "-",
  },
  {
    accessorKey: "user_approver",
    header: "User Approver",
    cell: ({ row }) => row.original.user_approver ?? "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge>{row.original.status}</Badge>,
  },
{
  id: "changes",
  header: "Detail",
  cell: ({ row }) => (
    <HistoryComparisonDialog data={row.original} />
  ),
},
  // {
  //   id: "changes",
  //   header: "Old Data vs New Data",
  //   cell: ({ row }) => {
  //     const oldData = flattenObject(row.original.old_value);

  //     const newData = flattenObject(row.original.new_value);

  //     // gabungkan key old dan new
  //     const allKeys = Array.from(
  //       new Set([...oldData.map((i) => i.key), ...newData.map((i) => i.key)]),
  //     );

  //     return (
  //       <div className="space-y-2 min-w-[500px]">
  //         {allKeys.map((key, index) => {
  //           const oldItem = oldData.find((i) => i.key === key);

  //           const newItem = newData.find((i) => i.key === key);

  //           const oldVal = oldItem?.value;
  //           const newVal = newItem?.value;

  //           const isChanged = String(oldVal) !== String(newVal);

  //           const isPrice = key.toLowerCase().includes("price");

  //           const formatValue = (val: any) => {
  //             if (val === null || val === undefined || val === "") {
  //               return "-";
  //             }

  //             if (isPrice) {
  //               return formatRupiah(Number(val));
  //             }

  //             return String(val);
  //           };

  //           return (
  //             <div
  //               key={index}
  //               className={`border rounded-md p-3 ${
  //                 isChanged ? "bg-yellow-50 border-yellow-200" : "bg-muted/20"
  //               }`}
  //             >
  //               <div className="text-xs font-semibold text-muted-foreground mb-2">
  //                 {oldItem?.label || newItem?.label}
  //               </div>

  //               <div className="flex items-center gap-2 flex-wrap">
  //                 <Badge
  //                   variant={isChanged ? "destructive" : "secondary"}
  //                   className="max-w-[200px] break-all"
  //                 >
  //                   {formatValue(oldVal)}
  //                 </Badge>

  //                 <span className="text-muted-foreground">→</span>

  //                 <Badge
  //                   variant={isChanged ? "default" : "secondary"}
  //                   className="max-w-[200px] break-all"
  //                 >
  //                   {formatValue(newVal)}
  //                 </Badge>
  //               </div>
  //             </div>
  //           );
  //         })}
  //       </div>
  //     );
  //   },
  // },
];
