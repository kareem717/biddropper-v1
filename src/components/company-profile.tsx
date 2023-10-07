"use client";
import { FC } from "react";
import { Button, buttonVariants } from "./ui/button";
import Link from "next/link";
import { AspectRatio } from "./ui/aspect-ratio";
import RatingSummary from "./rating-summary-card";
import useSWR from "swr";
import ContactCard from "./contact-card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import ReviewCard from "./review-card";
import { SelectReview, selectReviewSchema } from "@/lib/validations/reviews";
import RadiusMap from "./maps/radius-map";
const fetcher = (url: string, headers?: any) =>
	fetch(url, headers ? { headers } : undefined).then((res) => res.json());

interface CompanyProfileProps {
	id: string;
}

const CompanyProfile: FC<CompanyProfileProps> = ({ id }) => {
	const { data: reviewsData, error: reviewsFetchError } = useSWR(
		[
			`/api/reviews`,
			{
				"Company-Id": id,
			},
		],
		fetcher
	);
	const { data: companyData, error: companyFetchError } = useSWR(
		[
			`/api/companies`,
			{
				"Company-Id": id,
			},
		],
		fetcher
	);

	if (reviewsFetchError || companyFetchError) return <div>failed to load</div>;
	if (!reviewsData || !companyData) return <div>loading...</div>;

	const cleanReviews = reviewsData.map((review: any) =>
		selectReviewSchema.parse({
			...review.reviews,
			createdAt: new Date(review.reviews.createdAt),
			updatedAt: new Date(review.reviews.updatedAt),
		})
	);
	const company = companyData[0];
	const companyCoordinates = [
		company.addresses.xCoordinate,
		company.addresses.yCoordinate,
	];

	console.log(companyCoordinates);
	return (
		<div>
			<div className="relative h-[150px] sm:h-[250px] md:h-[min(25vh,400px)] overflow-hidden">
				<div className="absolute inset-0">
					<div
						style={{
							backgroundImage: `url(${company.media.fileUrl})`,
						}}
						className="w-full h-full bg-cover bg-center absolute blur-[30px]"
					/>
				</div>
				<div className="absolute rounded-md bottom-[8%] left-[2%] md:left-[1%] flex items-end gap-3 sm:gap-6">
					<div className="w-[80px] sm:w-[110px] md:w-[120px] lg:w-[130px]">
						<AspectRatio ratio={1 / 1}>
							<Image
								src={company.media.fileUrl}
								alt="company logo"
								fill={true}
								className="rounded-lg"
							/>
						</AspectRatio>
					</div>
					<div className="pb-1 sm:pb-4">
						<h1 className="text-sm sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white max-w-md">
							{company.companies.name}
						</h1>
					</div>
				</div>
			</div>

			{/* //TODO: figure out this grid system */}
			<div className="grid grid-cols-2 grid-rows-3 sm:grid-rows-2 gap-2 lg:gap-8 w-full">
				<RatingSummary
					reviews={cleanReviews}
					className="w-full col-span-2"
					companyId={id}
				/>

				<ContactCard
					website={company.companies.websiteUrl}
					phone={company.companies.phoneNumber}
					email={company.companies.emailAddress}
					address={company.addresses}
					// className="w-full sm:col-start-1 sm:col-end-3 lg:col-start-2 lg:col-end-3"
					className="w-full col-span-2 sm:col-span-1"
				/>

				<div
					className="rounded-lg overflow-hidden w-full col-span-2 sm:col-span-1"
					// className="rounded-lg overflow-hidden w-full sm:col-start-2 sm:col-end-4 lg:col-start-3 lg:col-end-4"
				>
					<RadiusMap
						coordinates={companyCoordinates}
						radius={company.companies.serviceArea}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				{cleanReviews.map((review: SelectReview, index: number) => (
					<ReviewCard key={index} review={review} />
				))}
			</div>
		</div>
	);
};

export default CompanyProfile;
