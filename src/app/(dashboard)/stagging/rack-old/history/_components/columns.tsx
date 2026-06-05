import { ColumnDef } from "@tanstack/react-table";

export const columnHistoryRackStagging = ({
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
