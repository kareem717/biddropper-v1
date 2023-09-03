"use client";
import React from "react";
import { Icons } from "./icons";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";

interface ImageCarouselProps {
	slides: string[];
	className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = (props) => {
	const { slides } = props;

	const images = slides.map((slide) => {
		return (
			<Image
				key={slide}
				src={slide}
				fill={true}
				alt="Job Image"
				className="w-full h-full rounded-2xl bg-center bg-cover duration-500"
			/>
		);
	});

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

	return (
		<div className={cn("relative group", props.className)}>
			<AspectRatio ratio={16 / 9} className="">{images[currentIndex]}</AspectRatio>

			<button className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
				<Icons.chevronLeft onClick={prevSlide} type="button" size={30} />
			</button>

			<button className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
				<Icons.chevronRight onClick={nextSlide} type="button" size={30} />
			</button>

			<div className="flex justify-center py-2">
				{slides.map((slide, slideIndex) => (
					<div
						key={slideIndex}
						onClick={() => goToSlide(slideIndex)}
						className={cn(
							"text-2xl cursor-pointer opacity-50",
							currentIndex === slideIndex && "opacity-100"
						)}
					>
						<Icons.dot />
					</div>
				))}
			</div>
		</div>
	);
};

export default ImageCarousel;
