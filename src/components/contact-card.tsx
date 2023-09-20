import React from "react";
import { ComponentPropsWithoutRef, FC } from "react";
import { Card } from "./ui/card";
import { Icons } from "./icons";
import Link from "next/link";
interface ContactCardProps extends ComponentPropsWithoutRef<typeof Card> {
	website: string;
	phone: string;
	email: string;
}
//todo: set up email functionality

const ContactCard: FC<ContactCardProps> = ({ ...props }) => {
	return (
		<Card {...props} className="w-min flex just">
			<div className="flex flex-col gap-4 mx-5 my-3">
				<div className="flex gap-2">
					<Icons.phone className="w-6 h-6" />
					<p>{props.phone}</p>
				</div>
				<div className="flex gap-2">
					<Icons.mail className="w-6 h-6" />
					<p className="max-w-[200px] truncate cursor-pointer hover:tez\">
						{props.email}
					</p>
				</div>

				<div className="flex gap-2 justify-items-center">
					<Icons.monitor className="w-6 h-6" />
					<Link href={props.website}>
						<p className="max-w-[200px] truncate cursor-pointer hover:underline">
							{props.website.split("://")[1]}
						</p>
					</Link>
				</div>
			</div>
		</Card>
	);
};

export default ContactCard;
