"use client";
import React from "react";
import { Icons } from "./icons";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
//TODO make this better, look nicer, and notice how when u clikc arrows really fast it selects text below it... idk y
interface ImageCarouselProps {
	slides: string[];
	className?: string;
}
const ImageCarousel: React.FC<ImageCarouselProps> = (props) => {
	const { slides } = props;

	const [currentIndex, setCurrentIndex] = React.useState(0);

	const prevSlide = () => {
		const isFirstSlide = currentIndex === 0;
		const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
		setCurrentIndex(newIndex);
	};

	const nextSlide = () => {
		const isLastSlide = currentIndex === slides.length - 1;
		const newIndex = isLastSlide ? 0 : currentIndex + 1;
		setCurrentIndex(newIndex);
	};

	const goToSlide = (slideIndex: number) => {
		setCurrentIndex(slideIndex);
	};
	// className={cn(
	//   "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
	//   required && "required"
	// )}
	return (
		<div className={cn(" relative group", props.className)}>
			<AspectRatio ratio={16 / 9}>
				<div
					style={{ backgroundImage: `url(${slides[currentIndex]})` }}
					className="w-full h-full rounded-2xl bg-center bg-cover duration-500"
				/>
			</AspectRatio>
			{/* Left Arrow */}
			<div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
				<Icons.chevronLeft onClick={prevSlide} size={30} />
			</div>
			{/* Right Arrow */}
			<div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
				<Icons.chevronRight onClick={nextSlide} size={30} />
			</div>
			<div className="flex top-4 justify-center py-2">
				{slides.map((slide, slideIndex) => (
					<div
						key={slideIndex}
						onClick={() => goToSlide(slideIndex)}
						className="text-2xl cursor-pointer"
					>
            {/*TODO not changing colour when selected */}
						<Icons.dot />
					</div>
				))}
			</div>
		</div>
	);
};

export default ImageCarousel;
