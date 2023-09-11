import React, { FC } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
interface BidPriceProps {
	price: number;
}
const BidPrice: FC<BidPriceProps> = ({ price }) => {
	return <div className="text-3xl text-[#16a34a] font-bold">{price}</div>;
};

export default BidPrice;
