import { ComponentPropsWithoutRef, FC } from "react";
import StarRating from "react-stars";
import { Progress } from "./ui/progress";
import { SelectReview } from "@/lib/validations/reviews";
import { Card } from "./ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
interface RatingSummaryProps extends ComponentPropsWithoutRef<typeof Card> {
	reviews: SelectReview[];
}

const RatingSummary: FC<RatingSummaryProps> = ({ reviews, ...props }) => {
	const totalReviews = reviews.length;
	const sortedReviewCount = reviews.reduce(
		(acc, review) => {
			// group rating its 0-1, 1-2, 2-3, 3-4, 4-5
			const ratingGroup = Math.floor(Number(review.rating) / 1);
			if (ratingGroup > 4) {
				acc[4] += 1;
			} else {
				acc[ratingGroup] += 1;
			}

			return acc;
		},
		{ 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 } as { [key: number]: number }
	);

	const averageRating =
		reviews.reduce((acc, review) => acc + Number(review.rating), 0) /
		totalReviews;

	return (
		<Card {...props}>
			<div className="flex w-full gap-6 flex-col my-3">
				<div className="flex flex-col items-center">
					<h2 className="font-bold text-2xl">Average Rating</h2>
					<StarRating
						edit={false}
						className="space-x-4"
						color1="black"
						count={5}
						value={averageRating} // TODO: replace with calculated value
						size={35}
						color2={"#16a34a"}
					/>
				</div>
				<div className="flex flex-col w-full px-6">
					<TooltipProvider delayDuration={300}>
						{Object.entries(sortedReviewCount).map(([key, value]) => {
							return (
								<Tooltip key={key}>
									<TooltipTrigger>
										<div className="flex gap-6">
											<h3 className={"text-lg font-semibold min-w-[40px]"}>
												{`${key} - ${Number(key) + 1}`}
											</h3>
											<Progress value={(value / totalReviews) * 100} />
										</div>
									</TooltipTrigger>
									<TooltipContent side="left">
										<p>{value}</p>
									</TooltipContent>
								</Tooltip>
							);
						})}
					</TooltipProvider>
				</div>
			</div>
		</Card>
	);
};

export default RatingSummary;
