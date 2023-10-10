import { SelectReview } from "@/lib/validations/posts/reviews";
import StarRating from "react-stars";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "./ui/card";
import { ComponentPropsWithoutRef } from "react";

interface ReviewCardProps extends ComponentPropsWithoutRef<typeof Card> {
	review: SelectReview;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, ...props }) => {
	//TODO: this implementation handles hours
	const formattedContractAge = (createdAt: Date) => {
		const contractAgeHours = Math.floor(
			(new Date().getTime() - new Date(createdAt).getTime()) / 1000 / 60 / 60
		);
		const contractAge = Math.floor(contractAgeHours / 24);

		const suffix = contractAge > 1 ? "s" : "";
		if (contractAge < 1) {
			return contractAgeHours < 1
				? "less than an hour"
				: `${contractAgeHours} hour${contractAgeHours > 1 ? "s" : ""}`;
		} else if (contractAge < 7) {
			return `${contractAge} day${suffix}`;
		} else if (contractAge < 30) {
			const weeks = Math.floor(contractAge / 7);
			return `${weeks} week${suffix}`;
		} else if (contractAge < 365) {
			const months = Math.floor(contractAge / 30);
			return `${months} month${suffix}`;
		} else {
			const years = Math.floor(contractAge / 365);
			return `${years} year${suffix}`;
		}
	};

	return (
		<Card {...props}>
			<CardHeader>
				<CardTitle>{review.title}</CardTitle>
				<StarRating
					edit={false}
					className="space-x-4"
					color1="black"
					count={5}
					value={Number(review.rating)}
					size={25}
					color2={"#16a34a"}
				/>
			</CardHeader>
			<CardContent>
				<p>{review.details}</p>
			</CardContent>
			{review.createdAt && (
				<CardFooter>
					<p className="text-sm text-gray-500 text-muted-foreground">
						Created {formattedContractAge(review.createdAt)} ago.
					</p>
				</CardFooter>
			)}
		</Card>
	);
};

export default ReviewCard;
