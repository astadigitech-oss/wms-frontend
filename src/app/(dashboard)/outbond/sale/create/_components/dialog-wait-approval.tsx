"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ShieldAlert } from "lucide-react";

const DialogWaitApproval = ({ open }: { open: boolean }) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        onClose={false}
        className="max-w-lg border-sky-400/50 shadow-2xl"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <ShieldAlert className="size-6" />
          </div>
          <DialogTitle className="text-xl">Menunggu Approval Kasir Leader</DialogTitle>
          <DialogDescription className="max-w-sm text-sm text-gray-600">
            Voucher rank belum disetujui. Halaman ini terkunci sampai status
            approval bernilai true.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-amber-300 bg-amber-50 p-4 text-center text-sm text-gray-700">
          <Loader2 className="size-5 animate-spin text-amber-700" />
          <p>
            Mohon tunggu approval voucher rank dari kasir leader. Sistem akan mengecek
            ulang secara otomatis.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogWaitApproval;
