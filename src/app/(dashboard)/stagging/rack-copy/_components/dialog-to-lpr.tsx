import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { X } from "lucide-react";
import React, { useState } from "react";

import { useLPRProductStaging } from "../_api/use-lpr-product-staging";

import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

export const DialogToLPR = ({
  open,
  productId,
  onOpenChange,
}: {
  open: boolean;
  productId: string;
  onOpenChange: () => void;
}) => {
  const { mutate: mutateToLPR, isPending: isPendingToLPR } =
    useLPRProductStaging();

  const [input, setInput] = useState({
    abnormal: "",
    damaged: "",
  });

  const handleMoveToLPR = (type: string) => {
    mutateToLPR(
      {
        id: productId,
        status: type,
        description: type === "abnormal" ? input.abnormal : input.damaged,
      },
      {
        onSuccess: () => {
          setInput({
            abnormal: "",
            damaged: "",
          });
          onOpenChange();
        },
      }
    );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onClose={false}
        className="max-w-xl"
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Move Product to LPR
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={() => onOpenChange()}
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Tabs className="flex flex-col gap-4" defaultValue="abnormal">
          <TabsList className="bg-transparent flex justify-start gap-2">
            <TabsTrigger asChild value="abnormal">
              <Button className="data-[state=active]:bg-sky-400/80 data-[state=active]:hover:bg-sky-400 font-medium bg-transparent shadow-none text-black hover:bg-sky-100">
                Abnormal
              </Button>
            </TabsTrigger>
            <TabsTrigger asChild value="damaged">
              <Button className="data-[state=active]:bg-sky-400/80 data-[state=active]:hover:bg-sky-400 font-medium bg-transparent shadow-none text-black hover:bg-sky-100">
                Damaged
              </Button>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="abnormal">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleMoveToLPR("abnormal");
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col w-full gap-1">
                <Label>Description</Label>
                <Textarea
                  disabled={isPendingToLPR}
                  rows={6}
                  placeholder="Type Abnormal Description"
                  className="resize-none border border-sky-400/80 focus-visible:ring-transparent focus-visible:outline-none"
                  value={input.abnormal}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      abnormal: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                disabled={isPendingToLPR}
                className="bg-orange-400/80 hover:bg-orange-400 text-black"
                type="submit"
              >
                Submit
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="damaged">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleMoveToLPR("damaged");
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col w-full gap-1">
                <Label>Description</Label>
                <Textarea
                  disabled={isPendingToLPR}
                  rows={6}
                  placeholder="Type Damaged Description"
                  className="resize-none border border-sky-400/80 focus-visible:ring-transparent focus-visible:outline-none"
                  value={input.damaged}
                  onChange={(e) =>
                    setInput((prev) => ({ ...prev, damaged: e.target.value }))
                  }
                />
              </div>
              <Button
                disabled={isPendingToLPR}
                className="bg-orange-400/80 hover:bg-orange-400 text-black"
                type="submit"
              >
                Submit
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
