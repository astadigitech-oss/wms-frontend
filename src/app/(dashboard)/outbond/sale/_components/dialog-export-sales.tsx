"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarIcon, ChevronDown, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

const DialogExportSales = ({
  open,
  onCloseModal,
  handleExport,
  isPending,
}: {
  open: boolean;
  onCloseModal: () => void;
  handleExport: (dateRange: { start_date: Date; end_date: Date }) => void;
  isPending: boolean;
}) => {
  const [start_date, setStartDate] = useState<Date | undefined>(undefined);
  const [end_date, setEndDate] = useState<Date | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    if (!open) {
      setStartDate(undefined);
      setEndDate(undefined);
      setDate(undefined);
      setIsOpen(false);
    }
  }, [open]);

  const handleDateSelection = () => {
    if (date?.from && date?.to) {
      handleExport({ start_date: date.from, end_date: date.to });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="w-auto max-w-5xl p-3 border-gray-300">
        <DialogHeader>
          <DialogTitle>Export Sales Reguler</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4 text-sm">
          <div className="w-full items-center flex justify-start px-3 border border-sky-400/80 rounded h-9">
            <CalendarIcon className="size-4 mr-2" />
            {start_date
              ? format(start_date, "MMMM dd, yyyy")
              : "Pick a start date"}{" "}
            -{" "}
            {end_date ? format(end_date, "MMMM dd, yyyy") : "Pick an end date"}
          </div>

          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                className="flex-none border-sky-400/80 hover:border-sky-400 hover:bg-sky-50 rounded"
                variant={"outline"}
                size={"icon"}
                disabled={isPending}
              >
                <ChevronDown className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-fit" align="end">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {[
                      { label: "Last Week", days: 7 },
                      { label: "Last Month", days: 30 },
                      { label: "2 Months ago", days: 60 },
                      { label: "3 Months ago", days: 90 },
                    ].map(({ label, days }) => (
                      <CommandItem
                        key={label}
                        onSelect={() => {
                          const newStartDate = subDays(new Date(), days);
                          const newEndDate = new Date();
                          setStartDate(newStartDate);
                          setEndDate(newEndDate);
                          setDate({ from: newStartDate, to: newEndDate });
                          setIsOpen(false);
                        }}
                      >
                        {label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-full p-2 border rounded border-sky-400/80">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={subDays(new Date(), 30)}
            selected={date}
            onSelect={(dateRange) => {
              if (dateRange) {
                setDate(dateRange);
                if (dateRange.from && dateRange.to) {
                  setStartDate(dateRange.from);
                  setEndDate(dateRange.to);
                } else {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }
              } else {
                setStartDate(undefined);
                setEndDate(undefined);
              }
            }}
            numberOfMonths={2}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01") || isPending
            }
          />
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            className="mr-2"
            onClick={onCloseModal}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDateSelection}
            disabled={!start_date || !end_date || isPending}
          >
            {isPending ? <Loader2 className="size-4 mr-1 animate-spin" /> : null}
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogExportSales;
