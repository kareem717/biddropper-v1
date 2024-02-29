"use client";
import { ComponentPropsWithoutRef, useState } from "react";
import { Button, buttonVariants } from "../../shadcn/ui/button";
import { cn } from "@/lib/utils/shadcn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import { Input } from "@/components/shadcn/ui/input";
import { Icons } from "../../icons";
import { toast } from "sonner";

interface BidButtonProps extends ComponentPropsWithoutRef<"button"> {
  jobId: string;
}

const BidButton: React.FC<BidButtonProps> = ({
  jobId,
  className,
  ...props
}) => {
  const [inputValue, setInputValue] = useState("");
  const [fetching, setFetching] = useState(false);
  const [open, setOpen] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const isValid = /^\d{0,8}(\.\d{0,2})?$/.test(value);

    if (isValid) {
      setInputValue(value);
    }
  };

  const enterBid = async () => {
    const res = await fetch(`/api/posts/bids`, {
      method: "POST",
      body: JSON.stringify({ price: inputValue, jobId, companyId: "fake_id" }),
    });

    if (!res.ok) {
      toast.error("Error entering bid");
      setFetching(false);

      return;
    }

    toast.success("Bid entered successfully");

    setFetching(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants(), className)}
        role="button"
        {...props}
      >
        Bid
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How much?</DialogTitle>
          <DialogDescription>
            Ennter the amount you want to bid
          </DialogDescription>
        </DialogHeader>
        {/* //todo: yo dosent this work exactly how i wanted currency input to? */}
        <div className="flex items-center space-x-2">
          <Icons.dollarSign />
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            max="99999999.99"
          />
        </div>

        {fetching ? (
          <Button disabled={true} type={"button"}>
            <Icons.spinner
              className="mr-2 h-4 w-4 animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">Loading</span>
          </Button>
        ) : (
          <Button
            type="submit"
            onClick={() => {
              setFetching(true);
              enterBid();
            }}
          >
            Enter Bid
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BidButton;
