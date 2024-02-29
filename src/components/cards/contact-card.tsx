import React from "react";
import { ComponentPropsWithoutRef, FC } from "react";
import { Card } from "../shadcn/ui/card";
import { Icons } from "../icons";
import Link from "next/link";
import { cn } from "@/lib/utils/shadcn";
import { SelectAddress } from "@/lib/validations/references/address";

interface ContactCardProps extends ComponentPropsWithoutRef<typeof Card> {
  website: string;
  phone: string;
  email: string;
  address?: SelectAddress;
}
//todo: set up email functionality

const ContactCard: FC<ContactCardProps> = ({ className, ...props }) => {
  return (
    <Card {...props} className={cn("flex w-min", className)}>
      <div className="mx-5 my-1 flex flex-col justify-center gap-4 ">
        <div className="flex gap-2">
          <Icons.phone className="h-6 w-6" />
          <p>{props.phone}</p>
        </div>
        <div className="flex gap-2">
          <Icons.mail className="h-6 w-6" />
          <p className="max-w-[200px] cursor-pointer truncate hover:underline">
            {props.email}
          </p>
        </div>
        <div className="flex justify-items-center gap-2">
          <Icons.monitor className="h-6 w-6" />
          <Link href={props.website}>
            <p className="max-w-[200px] cursor-pointer truncate hover:underline">
              {props.website}
            </p>
          </Link>
        </div>
        {props.address && (
          <div className="flex gap-2">
            <Icons.pin className="h-6 w-6" />
            <p className="max-w-[200px] truncate">
              {props.address.addressLine1}
              {props.address.addressLine2 && <br />}
              {props.address.addressLine2}
              <br />
              {props.address.city}, {props.address.region}
              <br />
              {props.address.postalCode},
              <br />
              {props.address.country}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContactCard;
