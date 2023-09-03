import React, { FC, useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
// import "swiper/css/pagination";
// import "swiper/css/navigation";

// import './styles.css';

// import required modules
import { Pagination, Navigation } from "swiper/modules";
import Image from "next/image";

interface ImageCarouselProps {
	slides: string[];
	className?: string;
}

const images = [
	"https://images.unsplash.com/photo-1590004953392-5aba2e72269a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
	"https://images.unsplash.com/photo-1590004845575-cc18b13d1d0a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
	"https://images.unsplash.com/photo-1590004987778-bece5c9adab6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
	"https://images.unsplash.com/photo-1590005176489-db2e714711fc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
];

const Slider: FC<ImageCarouselProps> = ({ slides, className }) => {
	return (
		<>
			<Swiper
				pagination={{
					type: "progressbar",
				}}
				navigation={true}
				modules={[Pagination, Navigation]}
				// className="w-[500px]"
			>
				{images.map((image, i) => (
					<SwiperSlide key={i}>
						<Image
							src={image}
							fill={true}
							alt="Image"
						/>
					</SwiperSlide>
				))}
				<SwiperSlide>Slide 1</SwiperSlide>
				<SwiperSlide>Slide 2</SwiperSlide>
				<SwiperSlide>Slide 3</SwiperSlide>
				<SwiperSlide>Slide 4</SwiperSlide>
				<SwiperSlide>Slide 5</SwiperSlide>
				<SwiperSlide>Slide 6</SwiperSlide>
				<SwiperSlide>Slide 7</SwiperSlide>
				<SwiperSlide>Slide 8</SwiperSlide>
				<SwiperSlide>Slide 9</SwiperSlide>
			</Swiper>
		</>
		// <Swiper
		//   spaceBetween={50}
		//   slidesPerView={1}
		//   onSlideChange={() => console.log('slide change')}
		//   onSwiper={(swiper) => console.log(swiper)}
		// >
		//   {/* {images.map((image, i) => ( */}
		//     <SwiperSlide >
		//       {/* <Image
		//       alt="Picture of the author"
		//         src={image}
		//         width={500}
		//         height={500}
		//         layout="responsive"
		//       /> */}
		//        <SwiperSlide>Slide 1</SwiperSlide>
		//   <SwiperSlide>Slide 2</SwiperSlide>
		//   <SwiperSlide>Slide 3</SwiperSlide>
		//   <SwiperSlide>Slide 4</SwiperSlide>
		//     </SwiperSlide>
		//   {/* ))} */}
		// </Swiper>
	);
};

export default Slider;
