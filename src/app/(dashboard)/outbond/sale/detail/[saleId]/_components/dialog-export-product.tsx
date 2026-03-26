"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { format } from "date-fns";
import {
  ArrowRight,
  Hexagon,
  Printer,
  SquareArrowOutUpRight,
  Star,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

const DialogExportProduct = ({
  open,
  onCloseModal,
  data,
}: {
  open: boolean;
  onCloseModal: () => void;
  data: any;
}) => {
  const [scale, setScale] = useState([50]);
  const [settingOpen, setSettingOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [pageBreak, setPageBreak] = useState<"none" | "total" | "catat">(
    "none",
  );
  const [cekOpen, setCekOpen] = useState(false);
  const [catatOpen, setCatatOpen] = useState(false);
  const loyalty = data?.buyer_loyalty;

  const showLoyaltyCard =
    loyalty?.upgrade_message_rank != null &&
    loyalty?.upgrade_message_discount != null &&
    loyalty?.expired_rank != null;

  function convertToRoman(num: number): string {
    const romanNumerals: { value: number; symbol: string }[] = [
      { value: 1000, symbol: "M" },
      { value: 900, symbol: "CM" },
      { value: 500, symbol: "D" },
      { value: 400, symbol: "CD" },
      { value: 100, symbol: "C" },
      { value: 90, symbol: "XC" },
      { value: 50, symbol: "L" },
      { value: 40, symbol: "XL" },
      { value: 10, symbol: "X" },
      { value: 9, symbol: "IX" },
      { value: 5, symbol: "V" },
      { value: 4, symbol: "IV" },
      { value: 1, symbol: "I" },
    ];

    let result = "";
    for (const { value, symbol } of romanNumerals) {
      while (num >= value) {
        result += symbol;
        num -= value;
      }
    }
    return result;
  }

  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    pageStyle: `@page { margin: 20mm 20mm 20mm 20mm !important; }`,
    documentTitle: `Document By Product - ${data?.buyer?.code_document_sale}`,
    contentRef,
  });

  const RankIcon = ({ rank }: { rank: string }) => {
    if (!rank) return null;

    const iconSize = 24;

    switch (rank.toLowerCase()) {
      case "bronze":
        return <Hexagon size={iconSize} color="#cd7f32" />;
      case "silver":
        return (
          <div className="relative w-6 h-6">
            <Hexagon size={iconSize} color="#c0c0c0" />
            <Hexagon
              size={10}
              className="absolute top-[7px] left-[7px] text-[#c0c0c0] fill-current"
            />
          </div>
        );
      case "gold":
        return (
          <div className="relative w-6 h-6">
            <Hexagon size={iconSize} color="#FFD700" />
            <Hexagon
              size={16}
              className="absolute top-[4px] left-[4px] text-[#FFD700] fill-current"
            />
          </div>
        );
      case "platinum":
        return (
          <div className="relative w-6 h-6">
            <Hexagon size={iconSize} color="#e5e4e2" />
            <Star
              size={10}
              className="absolute top-[7px] left-[7px] text-[#c0c0c0] fill-current"
            />
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (open) {
      setHintOpen(true);
      setPageBreak("none");
    }
  }, [open]);

  return (
    <div>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent
          onClose={false}
          className="max-w-6xl min-h-[90vh] justify-start flex flex-col"
        >
          <DialogHeader className="flex-row justify-between items-center">
            <div className="flex flex-col gap-1">
              <DialogTitle>Export Data</DialogTitle>
              <DialogDescription>
                Print Document / Save as PDF file
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="font-normal bg-sky-200 hover:bg-sky-200 text-black rounded-full">
                {pageBreak === "none" && "Default"}
                {pageBreak === "total" && "Summary Harga"}
                {pageBreak === "catat" && "Catatan Pembelian"}
              </Badge>
              <Dialog
                modal={true}
                open={settingOpen}
                onOpenChange={setSettingOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-yellow-400/80 text-black rounded-full hover:bg-yellow-400">
                    <SquareArrowOutUpRight className="w-4 h-4 mr-2" />
                    Setting
                  </Button>
                </DialogTrigger>
                <DialogContent onClose={false}>
                  <DialogHeader>
                    <DialogTitle>Setting Print</DialogTitle>
                    <DialogDescription>
                      Pilih salah satu opsi untuk <strong>Page Break</strong>{" "}
                      pencatakan dokumen
                    </DialogDescription>
                  </DialogHeader>
                  <RadioGroup
                    onValueChange={(e: "none" | "total" | "catat") =>
                      setPageBreak(e)
                    }
                    defaultValue={pageBreak}
                    className="w-full flex flex-col gap-2"
                  >
                    <Label
                      htmlFor={"1"}
                      className={cn(
                        "flex items-center gap-2 px-5 h-9 rounded-md hover:bg-sky-100 font-medium",
                        pageBreak === "none" && "bg-sky-100 hover:bg-sky-200",
                      )}
                    >
                      <RadioGroupItem value={"none"} id="1" />
                      <p>Default</p>
                    </Label>
                    <Label
                      htmlFor={"2"}
                      className={cn(
                        "flex items-center gap-2 px-5 h-9 rounded-md hover:bg-sky-100 font-medium",
                        pageBreak === "total" && "bg-sky-100 hover:bg-sky-200",
                      )}
                    >
                      <RadioGroupItem value={"total"} id="2" />
                      <p>Summary Harga</p>
                    </Label>
                    <Label
                      htmlFor={"3"}
                      className={cn(
                        "flex items-center gap-2 px-5 h-9 rounded-md hover:bg-sky-100 font-medium",
                        pageBreak === "catat" && "bg-sky-100 hover:bg-sky-200",
                      )}
                    >
                      <RadioGroupItem value={"catat"} id="3" />
                      <p>Catatan Pembelian</p>
                    </Label>
                  </RadioGroup>
                  <div className="w-full flex justify-end gap-4 items-center">
                    <Button
                      variant={"link"}
                      type="button"
                      onClick={() => setHintOpen(true)}
                      className="text-black/80 underline hover:text-black"
                    >
                      Hints
                    </Button>
                    <Button type="button" onClick={() => setSettingOpen(false)}>
                      Konfirmasi
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </DialogHeader>
          <div className="h-[70vh] w-full justify-center flex overflow-hidden">
            <div
              className={cn(
                "justify-center flex w-full",
                contentRef.current &&
                  contentRef.current.offsetHeight * (scale[0] / 100) >
                    window.innerHeight * 0.7 &&
                  `overflow-y-scroll`,
              )}
              style={{
                height: contentRef.current
                  ? contentRef.current.offsetHeight * (scale[0] / 100) >
                    window.innerHeight * 0.7
                    ? `${window.innerHeight * 0.7}px`
                    : `${contentRef.current.offsetHeight * (scale[0] / 100)}px`
                  : "0px",
              }}
              ref={containerRef}
            >
              <div
                className="origin-top w-fit h-fit border shadow rounded-md p-20"
                style={{ scale: scale[0] / 100 }}
              >
                <div
                  className="text-xs w-[21cm] min-h-[29.7cm] leading-normal"
                  ref={contentRef}
                >
                  {/* header */}
                  <div className="w-full flex justify-between items-center pb-3 mb-3 border-b-2 border-black">
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold">FORM VALIDASI</h3>
                      <p>
                        {data?.buyer?.code_document_sale +
                          "/LMS/" +
                          convertToRoman(new Date().getMonth() + 1) +
                          "/" +
                          new Date().getFullYear()}
                      </p>
                    </div>
                    <div className="relative aspect-[20/7] w-32">
                      <Image
                        src={"/images/bulky-black.png"}
                        alt="barcode"
                        className="object-contain"
                        fill
                      />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex flex-col font-bold">
                      <p>Cashier ID</p>
                      <p>Sales Reference</p>
                    </div>
                    <div className="flex flex-col">
                      <p>: {data?.data?.transactions_today}</p>
                      <p>: _______________________</p>
                    </div>
                  </div>
                  {showLoyaltyCard && (
                    <div className="w-full border border-black p-3 my-3 bg-gray-50">
                      <p className="font-bold mb-1">🎉 Selamat!</p>

                      <p className="text-justify">
                        Anda saat ini berada di{" "}
                        <span className="font-bold uppercase">
                          Rank {loyalty.upgrade_message_rank}
                        </span>{" "}
                        dan berhak mendapatkan{" "}
                        <span className="font-bold">
                          diskon {loyalty.upgrade_message_discount}%
                        </span>{" "}
                        untuk pembelanjaan selanjutnya.
                      </p>

                      <p className="mt-1 text-sm">
                        Masa berlaku rank hingga:{" "}
                        <span className="font-bold">
                          {loyalty.expired_rank}
                        </span>
                      </p>
                    </div>
                  )}

                  <h3 className="font-bold my-3">A. Identitas Pembeli</h3>
                  <div className="w-[99.8%] flex flex-col border border-black">
                    <div className="w-full flex">
                      <div className="flex w-full">
                        <p className="w-24 flex-none px-3 py-0.5 border-r border-black font-bold ">
                          Nama
                        </p>
                        <p className="w-full px-3 py-0.5 border-r border-black uppercase">
                          {data?.buyer?.buyer_name_document_sale}
                        </p>
                      </div>
                      <div className="flex w-1/3 flex-none">
                        <p className="w-1/3 flex-none px-3 py-0.5 border-r border-black font-bold">
                          NPWP
                        </p>
                        <p className="w-full px-3 py-0.5">-</p>
                      </div>
                    </div>
                    <div className="w-full flex border-t border-black">
                      <div className="flex w-full">
                        <p className="w-24 flex-none px-3 py-0.5 border-r border-black font-bold">
                          No. HP
                        </p>
                        <p className="w-full px-3 py-0.5 border-r border-black">
                          {data?.buyer?.buyer_phone_document_sale}
                        </p>
                      </div>
                      <div className="flex w-1/3 flex-none">
                        <p className="w-1/3 flex-none px-3 py-0.5 border-r border-black font-bold">
                          Tanggal
                        </p>
                        <p className="w-full px-3 py-0.5">
                          {format(
                            new Date(
                              data?.buyer?.created_at ?? new Date().toString(),
                            ),
                            "dd/MM/yyyy",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="w-full flex border-t border-black">
                      <div className="flex w-full">
                        <p className="w-24 flex-none px-3 py-0.5 border-r border-black font-bold">
                          Alamat
                        </p>
                        <p className="w-full px-3 py-0.5 capitalize">
                          {data?.buyer?.buyer_address_document_sale}
                        </p>
                      </div>
                      <div className="flex w-1/3 flex-none">
                        <p className="w-1/3 flex-none px-3 py-0.5 border-x border-black font-bold">
                          Discount
                        </p>
                        <p className="w-full px-3 py-0.5">
                          {data?.buyer_loyalty?.percentage_discount ?? "0"}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full flex border-t border-black">
                      <div className="flex w-full">
                        <p className="w-24 flex-none px-3 py-0.5 border-r border-black font-bold">
                          Kelas
                        </p>
                        <div className="w-full px-3 py-0.5 flex items-center gap-3">
                          <RankIcon rank={data?.buyer_loyalty?.rank} />
                          <span>{data?.buyer_loyalty?.rank ?? "-"}</span>
                          <span className="text-[11px]">
                            (exp. {data?.buyer_loyalty?.expired_rank ?? "-"})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex border-t border-black">
                      <div className="flex w-full">
                        <p className="w-24 flex-none px-3 py-0.5 border-r border-black font-bold">
                          Jumlah Transaksi Saat Ini
                        </p>
                        <p className="w-full px-3 py-0.5 flex items-center gap-3">
                          <span>
                            {data?.buyer_loyalty?.current_transaction ?? "-"}
                          </span>
                        </p>
                      </div>
                      <div className="flex w-1/3 flex-none">
                        <p className="w-1/3 flex-none px-3 py-0.5 border-x border-black font-bold">
                          Transaksi Berikutnya Untuk Naik Kelas
                        </p>
                        <p className="w-full px-3 py-0.5 flex items-center gap-3">
                          <span>
                            {data?.buyer_loyalty?.transaction_next ?? "-"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="my-3 text-justify indent-5">
                    Bahwa yang bersangkutan di atas telah melakukan pemilihan
                    dan pemilahan atas barang yang berada di area Bulky dan
                    sepakat untuk melakukan pembelian sebagaimana detail barang
                    & harga berlaku di bawah:
                  </p>
                  <h3 className="font-bold my-3">
                    B. Informasi Harga Jual & Diskon berlaku
                  </h3>
                  <div className="w-[99.8%] flex-col flex border-2 border-black">
                    <div className="w-full flex font-bold">
                      <div className="w-10 flex-none border-r border-black text-center py-0.5">
                        No
                      </div>
                      <div className="w-36 flex-none border-r border-black px-3 py-0.5">
                        Barcode
                      </div>
                      <div className="w-full border-r border-black px-3 py-0.5">
                        Nama Barang
                      </div>
                      <div className="w-12 flex-none border-r border-black text-center py-0.5">
                        Qty
                      </div>
                      <div className="w-32 flex-none px-3 py-0.5">Harga</div>
                    </div>
                    <div className="flex w-full flex-col relative">
                      {data?.buyer?.sales?.map((item: any, index: number) => (
                        <div
                          key={
                            item.barcode +
                            item.product_name_sale +
                            item.product_qty_sale +
                            item.product_price_sale
                          }
                          className="w-full flex border-t border-black first:border-t-2"
                        >
                          <div className="w-10 flex-none border-r border-black text-center py-0.5">
                            {index + 1}
                          </div>
                          <div className="w-36 flex-none border-r border-black px-3 py-0.5 uppercase">
                            {item.product_barcode_sale}
                          </div>
                          <div className="w-full border-r break-all border-black px-3 py-0.5 capitalize whitespace-pre-wrap">
                            {item.product_name_sale}
                          </div>
                          <div className="w-12 flex-none border-r border-black text-center  py-0.5">
                            {item.product_qty_sale}
                          </div>
                          <div className="w-32 flex-none px-3 py-0.5">
                            {formatRupiah(item.product_price_sale) ?? "Rp 0"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      pageBreakBefore:
                        pageBreak === "total" ? "always" : "auto",
                    }}
                    className="w-full flex items-end flex-col mt-3 font-bold"
                  >
                    <div className="flex">
                      <p className="px-3">Subtotal</p>
                      <p className="w-12 flex-none text-center">
                        {data?.buyer?.total_product_document_sale}
                      </p>
                      <p className="w-32 flex-none pr-3 text-end tabular-nums">
                        {formatRupiah(
                          data?.buyer?.total_display_document_sale,
                        ) ?? "Rp 0"}
                      </p>
                    </div>
                    <div className="flex">
                      <p className="px-3">Kardus</p>
                      <p className="w-12 flex-none text-center">
                        {data?.buyer?.cardbox_qty}
                      </p>
                      <p className="w-32 flex-none pr-3 text-end tabular-nums">
                        {formatRupiah(data?.buyer?.cardbox_total_price) ??
                          "Rp 0"}
                      </p>
                    </div>
                    <div className="flex">
                      <p className="px-3">Voucher</p>
                      <p className="w-12 flex-none" />
                      <p className="w-32 flex-none pr-3 text-end tabular-nums">
                        -{formatRupiah(data?.buyer?.voucher) ?? "Rp 0"}
                      </p>
                    </div>
                    {(data?.buyer?.total_display_document_sale ?? 0) >= 5000000 && (
                      <div className="flex">
                        <p className="px-3">Discount Class</p>
                        <p className="w-12 flex-none" />
                        <p className="w-32 flex-none pr-3 text-end tabular-nums">
                          -{" "}
                          {formatRupiah(
                            data?.buyer_loyalty?.total_disc_rank ?? 0,
                          )}
                        </p>
                      </div>
                    )}
                    <div className="flex border-t border-black pt-1 mt-1 pl-10 border-dashed">
                      <p className="px-3">DPP</p>
                      <p className="w-12 flex-none" />
                      <p className="w-32 flex-none pr-3 text-end tabular-nums">
                        {formatRupiah(data?.buyer?.grand_total) ?? "Rp 0"}
                      </p>
                    </div>
                    <div className="flex border-b border-black pb-1 mb-1 pl-10 border-dashed">
                      <p className="px-3">PPN</p>
                      <p className="w-12 flex-none text-center">
                        {Math.round(data?.buyer?.tax)}%
                      </p>
                      <p
                        className={cn(
                          "w-32 flex-none pr-3 text-end tabular-nums",
                          !data?.buyer?.is_tax && "line-through decoration-2",
                        )}
                      >
                        {formatRupiah(
                          (data?.buyer?.grand_total / 100) * data?.buyer?.tax,
                        ) ?? "Rp 0"}
                      </p>
                    </div>
                    <div className="flex">
                      <p className="px-3">Total</p>
                      <p className="w-12 flex-none" />
                      <p className="w-32 flex-none pr-3 text-end tabular-nums">
                        {formatRupiah(data?.buyer?.price_after_tax) ?? "Rp 0"}
                      </p>
                    </div>
                  </div>
                  <div
                    className="my-3"
                    style={{
                      pageBreakBefore:
                        pageBreak === "catat" ? "always" : "auto",
                    }}
                  >
                    <h5 className="font-bold underline">Catatan Pembelian</h5>
                    <p className="text-justify indent-5 mt-3">
                      Masing-masing pihak tidak bertanggung jawab atas,
                      perbuatan melawan hukum, kelalaian, pelanggaran atau
                      segala kerugian, kerusakan, ongkos atau biaya dalam bentuk
                      apapun yang harus dibayar atau diderita oleh pihak yang
                      lain:
                    </p>
                    <ul className="ml-5">
                      <li>
                        (a) baik yang bersifat tidak langsung atau konsekuensial
                        atau
                      </li>
                      <li>
                        (b) yang terkait dengan kerugian ekonomi, keuntungan
                        atau reputasi bisnis.
                      </li>
                    </ul>
                  </div>
                  <div className="w-full flex mt-6 font-bold">
                    <div className="w-full flex justify-center flex-col items-center">
                      <p></p>
                      <p className="h-20" />
                      <p className="uppercase border-b px-3 border-black">
                        {data?.buyer?.buyer_name_document_sale}
                      </p>
                      <p>Nama Pembeli</p>
                    </div>
                    <div className="w-full flex justify-center flex-col items-center">
                      <p>Dibuat:</p>
                      <p className="h-20"></p>
                      <p className="uppercase border-b px-3 border-black">
                        {data?.data?.name_user}
                      </p>
                      <p>Admin Kasir</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-6 justify-between">
            <div className="flex gap-4 items-center">
              <Button
                onClick={onCloseModal}
                className="bg-gray-300/80 text-black rounded-full hover:bg-gray-300"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>

              <Button
                onClick={() => handlePrint()}
                className="bg-sky-400/80 text-black rounded-full hover:bg-sky-400"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
            <div className="w-1/3 flex gap-2 items-center">
              <Slider
                defaultValue={scale}
                max={100}
                min={10}
                step={1}
                onValueChange={(e) => setScale(e)}
              />
              <p className="text-sm w-1/5 text-center">{scale[0]}%</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog modal={true} open={hintOpen} onOpenChange={setHintOpen}>
        <DialogContent onClose={false}>
          <DialogHeader className="border-b border-black pb-5">
            <DialogTitle className="flex justify-between items-center">
              🌟 Hints & Tips
              <TooltipProviderPage value="close" side="left">
                <button
                  onClick={() => setHintOpen(false)}
                  className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </TooltipProviderPage>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 text-sm">
            <ul className="list-disc pl-5 gap-2 flex flex-col text-sm leading-relaxed text-justify">
              <li>
                Sebelum mencetak dokumen harap melihat tampilan print dengan
                menekan tombol print.
              </li>
              <li>
                Jika terdapat bagian dokumen yang terpotong anda dapat kembali
                dan menyesuaikan <strong>Page Break</strong> dengan menekan
                tombol <strong>Setting</strong>.
              </li>
              <li>
                Terdapat 2 opsi: <strong>Summary Harga</strong> dan{" "}
                <strong>Catatan Pembelian</strong> untuk{" "}
                <strong>Page Break</strong>, ada dapat memilih salah satunya.
              </li>
            </ul>
            <div className="flex flex-col gap-2 border-t border-black pt-5 mt-3">
              <p>
                Contoh opsi <strong>Page Break</strong>
              </p>
              <div className="flex gap-3 w-full">
                <Dialog modal={true} open={cekOpen} onOpenChange={setCekOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <SquareArrowOutUpRight className="w-4 h-4 mr-2" />
                      Summary Harga
                    </Button>
                  </DialogTrigger>
                  <DialogContent onClose={false} className="max-w-4xl">
                    <DialogHeader className="border-b border-black pb-5 mb-5">
                      <DialogTitle>🌟 Page Break Summary Harga</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-3 items-center">
                      <div className="flex flex-col gap-2 w-full">
                        <p className="text-sm">
                          - Sebelum{" "}
                          <span className="font-bold bg-sky-100 px-2 py-0.5 rounded">
                            Page Break
                          </span>
                        </p>
                        <div className="w-full aspect-video relative rounded-md shadow-md border-gray-300 overflow-hidden border">
                          <Image
                            src={"/images/total.webp"}
                            fill
                            priority
                            alt="total-before"
                            className="object-cover place-items-center"
                          />
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shadow border bg-sky-100 flex-none">
                        <ArrowRight className="w-5 h--5" />
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <p className="text-sm">
                          - Setelah{" "}
                          <span className="font-bold bg-sky-100 px-2 py-0.5 rounded">
                            Page Break
                          </span>
                        </p>
                        <div className="w-full aspect-video relative rounded-md shadow-md border-gray-300 overflow-hidden border">
                          <Image
                            src={"/images/pb-total.webp"}
                            fill
                            priority
                            alt="total-after"
                            className="object-cover place-items-center"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-5 mt-5 border-t border-black">
                      <Button
                        type="button"
                        className="text-black bg-sky-400/80 hover:bg-sky-500 hover:text-black"
                        onClick={() => setCekOpen(false)}
                      >
                        Mengerti
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog
                  modal={true}
                  open={catatOpen}
                  onOpenChange={setCatatOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <SquareArrowOutUpRight className="w-4 h-4 mr-2" />
                      Catatan Pembelian
                    </Button>
                  </DialogTrigger>
                  <DialogContent onClose={false} className="max-w-4xl">
                    <DialogHeader className="border-b border-black pb-5 mb-5">
                      <DialogTitle>🌟 Page Break Catatan Pembelian</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-3 items-center">
                      <div className="flex flex-col gap-2 w-full">
                        <p className="text-sm">
                          - Sebelum{" "}
                          <span className="font-bold bg-sky-100 px-2 py-0.5 rounded">
                            Page Break
                          </span>
                        </p>
                        <div className="w-full aspect-video relative rounded-md shadow-md border-gray-300 overflow-hidden border">
                          <Image
                            src={"/images/catat.webp"}
                            fill
                            priority
                            alt="catat-before"
                            className="object-cover place-items-center"
                          />
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shadow border bg-sky-100 flex-none">
                        <ArrowRight className="w-5 h--5" />
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <p className="text-sm">
                          - Setelah{" "}
                          <span className="font-bold bg-sky-100 px-2 py-0.5 rounded">
                            Page Break
                          </span>
                        </p>
                        <div className="w-full aspect-video relative rounded-md shadow-md border-gray-300 overflow-hidden border">
                          <Image
                            src={"/images/pb-catat.webp"}
                            fill
                            priority
                            alt="catat-after"
                            className="object-cover place-items-center"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-5 mt-5 border-t border-black">
                      <Button
                        type="button"
                        className="text-black bg-sky-400/80 hover:bg-sky-500 hover:text-black"
                        onClick={() => setCatatOpen(false)}
                      >
                        Mengerti
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogExportProduct;
