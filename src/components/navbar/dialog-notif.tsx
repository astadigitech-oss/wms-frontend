"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import Link from "next/link";
import { Separator } from "../ui/separator";
import { alertError, cn } from "@/lib/utils";
import { formatDistanceStrict } from "date-fns";
import { id as indonesia } from "date-fns/locale";
import { Bell, Circle } from "lucide-react";
import { useGetNotifWidget } from "./_api/get-notif-widget";
import { AxiosError } from "axios";

const NodeNotif = ({ item }: { item: any }) => {
  return (
    <div className=" flex hover:bg-gray-50 px-2.5 py-2 rounded items-center cursor-default justify-between">
      <div
        className={cn(
          "flex-col flex border-l-4 pl-2",
          item.status === "done" && "border-green-500",
          item.status === "pending" && "border-yellow-500",
          item.status === "display" && "border-sky-500",
          item.status === "sale" && "border-indigo-500",
          item.status === "inventory" && "border-amber-700",
          item.status === "staging" && "border-rose-400",
          item.status === "palet" && "border-purple-500",
          item.status === "manual_inbound" && "border-red-400",
          item.status === "pending_approval" && "border-emerald-600"
        )}
      >
        <p className="text-xs capitalize flex gap-1">
          {item.notification_name}
          {item.status === "sale" && (
            <span className="font-semibold underline">
              {item.approved === "0" && " - Required"}
              {item.approved === "1" && " - Rejected"}
              {item.approved === "2" && " - Approved"}
            </span>
          )}
        </p>
        <p className="text-xs font-light text-gray-500">
          {formatDistanceStrict(new Date(item.created_at), new Date(), {
            addSuffix: true,
            locale: indonesia,
          })}
        </p>
      </div>
    </div>
  );
};

export const DialogNotif = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isError, error, isLoading } = useGetNotifWidget({
    open: isOpen,
  });

  const listData: any[] = useMemo(() => {
    return data?.data?.data?.resource;
  }, [data]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      action: "get data",
      data: "Notif Data",
      method: "GET",
    });
  }, [isError, error]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={isLoading}
          className="w-8 h-8 p-0 rounded-full bg-transparent hover:bg-gray-50 text-black relative border-sky-400 border"
        >
          <Bell className="w-4 h-4" />
          <div className="w-2.5 h-2.5 rounded-full absolute -top-[0.5px] -right-[0.5px] bg-sky-500" />
          <div className="w-2.5 h-2.5 rounded-full absolute -top-[0.5px] -right-[0.5px] bg-sky-500 animate-ping opacity-75" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-1 gap-1 flex flex-col w-full max-w-2xl"
        align="end"
        sideOffset={15}
      >
        <div className="flex justify-between w-full items-center px-2.5 py-1">
          <p className="text-sm font-semibold">Notification</p>
          <Button
            asChild
            type="button"
            onClick={() => {
              setIsOpen(false);
            }}
            className="text-xs h-auto py-1 px-2 bg-sky-400/80 hover:bg-sky-400 font-normal rounded-sm text-black"
          >
            <Link href={"/notification"}>Read More</Link>
          </Button>
        </div>
        <Separator />
        {listData?.map((item) => (
          <NodeNotif item={item} key={item.id} />
        ))}
        <div className="grid grid-cols-3 border-t text-xs ">
          <div className="flex items-center w-full px-2.5 pt-2 pb-1">
            <Circle className="size-3 mr-2 fill-yellow-500 text-transparent" />
            <p>Pending</p>
          </div>
          <div className="flex items-center w-full  px-2.5 pt-2 pb-1">
            <Circle className="size-3 mr-2 fill-green-500 text-transparent" />
            <p>Done</p>
          </div>
          <div className="flex items-center w-full  px-2.5 pt-2 pb-1">
            <Circle className="size-3 mr-2 fill-sky-500 text-transparent" />
            <p>Display</p>
          </div>
          <div className="flex items-center w-full px-2.5 pt-2 pb-1">
            <Circle className="size-3 mr-2 fill-indigo-500 text-transparent" />
            <p>Sale</p>
          </div>
          <div className="flex items-center w-full px-2.5 pt-2 pb-1">
            <Circle className="size-3 mr-2 fill-amber-700 text-transparent" />
            <p>Inventory</p>
          </div>
          <div className="flex items-center w-full px-2.5 pt-2 pb-1">
            <Circle className="size-3 mr-2 fill-rose-300 text-transparent" />
            <p>Staging</p>
          </div>
          <div className="flex items-center w-full px-2.5 pt-2 pb-1">
            <Circle className="size-3 mr-2 fill-purple-500 text-transparent" />
            <p>Palet</p>
          </div>
          <div className="flex items-center w-full px-2.5 pt-2 pb-1">
            <Circle className="size-3 mr-2 fill-red-400 text-transparent" />
            <p>Manual Inbound</p>
          </div>
          <div className="flex items-center w-full px-2.5 pt-2 pb-1">
            <Circle className="size-3 mr-2 fill-emerald-600 text-transparent" />
            <p>Pending Approval</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
