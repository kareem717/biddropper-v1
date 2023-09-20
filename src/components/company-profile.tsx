"use client";
import { FC } from "react";
import { Button, buttonVariants } from "./ui/button";
import Link from "next/link";
import { AspectRatio } from "./ui/aspect-ratio";
import RatingSummary from "./rating-summary-card";
import useSWR from "swr";
import ContactCard from "./contact-card";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CompanyProfileProps {
	id: string;
}

const CompanyProfile: FC<CompanyProfileProps> = ({ id }) => {
	const { data, error } = useSWR(`/api/reviews`, fetcher);

	if (error) return <div>failed to load</div>;
	if (!data) return <div>loading...</div>;

	return (
		<div>
			<div className="bg-gray-500 h-[150px] sm:h-[250px] md:h-[min(25vh,400px)] relative">
				<div className="w-[80px] sm:w-[110px] md:w-[120px] lg:w-[130px] absolute rounded-md bottom-[8%] left-[2%] md:left-[1%]">
					<AspectRatio ratio={1 / 1} className="bg-black"></AspectRatio>
				</div>
			</div>
			<RatingSummary reviews={data} className="w-full md:w-[30vw]" />
			<ContactCard
				website="https://www.google.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.comgoogle.com"
				phone="xxxxxxxxxxxxxxxxxxxx"
				email="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi sit amet posuere dui"
			/>
			<Link className={buttonVariants()} href={`/reviews/create/${id}`}>
				Create a review
			</Link>
		</div>
	);
};

export default CompanyProfile;
