"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FC } from "react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import useContractList from "@/hooks/use-contract-list";

interface ContractCardProps {
  id: string;
  details: string;
  isActive: boolean;
  createdAt: Date;
  title: string;
  price: string;
  endDate: Date | null;
  totalJobs: number;
  totalBids: number;
  companiesInContract: number;
}

const ContractCard: FC<ContractCardProps> = ({
  id,
  title,
  isActive,
  price,
  details,
  endDate,
  totalJobs,
  totalBids,
  createdAt,
}) => {
  const { select, selected } = useContractList();

  const formattedPrice = Number(price)
    .toLocaleString(undefined, {
      style: "currency",
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
      currency: "CAD",
    })
    .replace(/,/g, " ");

  const formattedContractAge = (createdAt: Date) => {
    const contractAgeHours = Math.floor(
      (new Date().getTime() - new Date(createdAt).getTime()) / 1000 / 60 / 60,
    );
    const contractAge = Math.floor(contractAgeHours / 24);

    switch (true) {
      case contractAge < 1:
        return contractAgeHours < 1
          ? "less than an hour"
          : `${contractAgeHours} hour${contractAgeHours > 1 ? "s" : ""}`;
      case contractAge < 7:
        var suffix = contractAge > 1 ? "s" : "";
        return `${contractAge} day${suffix}`;
      case contractAge < 30:
        const weeks = Math.floor(contractAge / 7);
        var suffix = weeks > 1 ? "s" : "";

        return `${weeks} week${suffix}`;
      case contractAge < 365:
        const months = Math.floor(contractAge / 30);
        var suffix = months > 1 ? "s" : "";

        return `${months} month${suffix}`;
      default:
        const years = Math.floor(contractAge / 365);
        var suffix = years > 1 ? "s" : "";

        return `${years} year${suffix}`;
    }
  };

  return (
    <div className="h-full w-full">
      <Card
        onClick={() => select(id)}
        className={cn(
          "mx-2 h-full w-full overflow-hidden rounded-xl border-2 border-gray-200 shadow-md transition-all duration-500 ease-in-out hover:shadow-lg md:mx-auto",
          selected === id && "border-gray-400",
        )}
      >
        <CardHeader className="m-4">
          <CardTitle className="text-xl font-semibold">
            <Link href={`/contracts/${id}`} className="capitalize">
              {title}
            </Link>
          </CardTitle>
          <p className="overflow-hidden overflow-ellipsis text-sm text-gray-500">
            {details}
          </p>
        </CardHeader>
        <CardContent className="m-4 flex justify-between">
          <div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Icons.calendar className="mr-2 h-5 w-5 text-gray-400" />
              <p>Created {formattedContractAge(createdAt)} ago</p>
            </div>

            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Icons.briefcase className="mr-2 h-5 w-5 text-gray-400" />
              <p>
                {totalJobs} Job{totalJobs != 1 && "s"}
              </p>
            </div>

            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Icons.bankNote className="mr-2 h-5 w-5 text-gray-400" />
              <p>{formattedPrice}</p>
            </div>
          </div>

          <div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Icons.calendarX className="mr-2 h-5 w-5 text-gray-400" />
              <p>
                {endDate
                  ? `Expires on ${format(new Date(endDate), "MM/dd/yyyy")}`
                  : "No expiry date"}
              </p>
            </div>

            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Icons.gavel className="mr-2 h-5 w-5 text-gray-400" />
              <p>
                {totalBids} Bid{totalBids != 1 && "s"}
              </p>
            </div>

            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Icons.checkCircle
                className={cn(
                  "mr-2 h-5 w-5",
                  isActive ? "text-green-600" : "text-red-600",
                )}
              />
              <p>{isActive ? "Active" : "Inactive"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractCard;
