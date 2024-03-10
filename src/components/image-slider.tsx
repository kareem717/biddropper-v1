import { FC, ComponentPropsWithoutRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface ImageSliderProps extends ComponentPropsWithoutRef<"div"> {
  images: string[];
  swiperProps?: ComponentPropsWithoutRef<typeof Swiper>;
  swiperSlideProps?: ComponentPropsWithoutRef<typeof SwiperSlide>;
  imageProps?: ComponentPropsWithoutRef<typeof Image>;
}

const ImageSlider: FC<ImageSliderProps> = ({
  images,
  className,
  swiperProps,
  swiperSlideProps,
  imageProps,
  ...props
}) => {
  return (
    <div className={className} {...props}>
      <Swiper
        pagination={{
          type: "progressbar",
        }}
        navigation={true}
        modules={[Pagination, Navigation]}
        {...swiperProps}
      >
        {images.map((image, i) => (
          <SwiperSlide key={i} {...swiperSlideProps}>
            <Image src={image} fill={true} alt="Image" {...imageProps} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;
