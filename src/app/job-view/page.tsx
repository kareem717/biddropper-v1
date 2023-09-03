"use client";

import JobCard from "@/components/job-card";
import Head from "next/head";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import ImageCarousel from "@/components/image-carousel";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer } from "recharts";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import './styles.css';

// import required modules
import { Pagination, Navigation } from "swiper/modules";
import Image from "next/image";
import { useConfig } from "@/hooks/use-config";

import { themes } from "@/components/themes";
import Slider from "@/components/keen-slider";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function JobView() {
	const { theme: mode } = useTheme();
	const [config] = useConfig();

	const theme = themes.find((theme) => theme.name === config.theme);
	mapboxgl.accessToken =
		"pk.eyJ1Ijoia2FyZWVtNzE3IiwiYSI6ImNsbTI3dm52YzA0Z2YzZ25sbW43bW82cmoifQ.WHZcCQuobO1CPGcmdvKArQ";

	const mapContainer = useRef(null);
	const map = useRef(null);
	const [lng, setLng] = useState(-79.1536063);
	const [lat, setLat] = useState(44.0433684);
	const [zoom, setZoom] = useState(15);

	useEffect(() => {
		if (map.current) return; // initialize map only once
		map.current = new mapboxgl.Map({
			container: mapContainer.current as any,
			style: "mapbox://styles/mapbox/streets-v12",
			center: [lng, lat],
			zoom: zoom,
		}) as any;
	});

	const images = [
		"https://images.unsplash.com/photo-1590004953392-5aba2e72269a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
		"https://images.unsplash.com/photo-1590004845575-cc18b13d1d0a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
		"https://images.unsplash.com/photo-1590004987778-bece5c9adab6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
		"https://images.unsplash.com/photo-1590005176489-db2e714711fc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
	];
	const data = [
		{
			revenue: 0,
			day: 1,
		},
		{
			revenue: 5,
			day: 2,
		},
		{
			revenue: 3,
			day: 3,
		},
		{
			revenue: 9,
			day: 4,
		},
	];
	return (
		<div className="w-full h-screen bg-[url('/images/blob-scene.svg')] bg-cover relative xl:bg-bottom">
			<Card className="sm:w-[min(80vw,1250px)] w-[95vw]  bg-background absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4">
				<CardHeader>
					<CardTitle>Job Title</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col max-h-[95vh] overflow-auto md:flex-row h-[70vh] w-full items-center justify-between space-x-6 ">
					<div className="h-full md:w-[50%] rounded-md grid grid-rows-2 gap-4">
						<div className="rounded-md border overflow-hidden">
							<Swiper
								pagination={{
									type: "progressbar",
								}}
								navigation={true}
								modules={[Pagination, Navigation]}
								className="w-full h-full"
							>
								{images.map((image, i) => (
									<SwiperSlide key={i}>
										<Image src={image} fill={true} alt="Image" />
									</SwiperSlide>
								))}
							</Swiper>
						</div>
						<ScrollArea className="rounded-md border p-4" >
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque a
							diam purus. Interdum et malesuada fames ac ante ipsum primis in
							faucibus. Suspendisse hendrerit viverra dapibus. Nunc ullamcorper
							est neque, a mollis mi suscipit quis. Duis libero erat, interdum
							et nunc eget, commodo feugiat augue. Quisque volutpat lectus ex,
							vel consectetur leo luctus non. Ut aliquet condimentum mauris. In
							suscipit et lectus sed mollis. In sed scelerisque est.
							Pellentesque habitant morbi tristique senectus et netus et
							malesuada fames ac turpis egestas. Vivamus consequat dui a diam
							interdum imperdiet. Maecenas fringilla dictum odio, eu interdum
							magna viverra nec. Proin fermentum in nisl sed aliquet. Vestibulum
							ultricies lobortis venenatis. Morbi et erat vitae nibh congue
							pellentesque vitae scelerisque massa. Nam malesuada ex eu
							fringilla faucibus. Duis ullamcorper, turpis quis vestibulum
							cursus, lacus neque accumsan velit, non dignissim diam metus in
							elit. In in porta mauris. Aliquam in suscipit nulla, a malesuada
							quam. Pellentesque sed erat rhoncus, lacinia lectus eu, blandit
							diam. Vivamus laoreet posuere tellus sit amet euismod. Praesent eu
							risus orci. Nullam et nisl gravida, cursus mauris eu, elementum
							nisi. Donec pellentesque dui ante. Nunc efficitur iaculis leo ac
							mollis. Nulla rutrum, dui ac venenatis interdum, nisl diam congue
							ante, sit amet convallis leo est vel diam. Cras in posuere nunc,
							quis euismod diam. Donec ullamcorper interdum lacus in imperdiet.
							Morbi interdum blandit lectus, bibendum gravida lectus tincidunt
							a. Donec facilisis tortor ac tortor auctor, quis congue libero
							gravida. Suspendisse non sem ut velit ultricies accumsan.
							Suspendisse placerat semper porta. Integer gravida sit amet diam
							at porta. Duis ut diam a risus facilisis mattis id lobortis dolor.
							Praesent volutpat venenatis urna eu malesuada. Suspendisse
							lobortis auctor erat vel sollicitudin. Nam eget massa nec erat
							iaculis vulputate eget quis risus. Aliquam posuere libero arcu,
							eget luctus purus vehicula maximus. Vivamus vitae magna
							consectetur, rhoncus lectus sed, bibendum neque. Nulla semper
							nulla non lectus varius tristique. Curabitur mattis pellentesque
							velit, a ultricies leo faucibus quis. Suspendisse euismod, justo
							mollis facilisis gravida, ipsum elit euismod mauris, nec pulvinar
							enim diam sed felis. Quisque id condimentum enim. Praesent
							eleifend metus eu tempus interdum. Quisque ornare id risus vel
							sodales. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
							Nulla hendrerit velit magna, sit amet accumsan sem tincidunt sed.
							Phasellus id lectus vel turpis pellentesque tristique. Praesent eu
							mi ultrices, eleifend quam quis, rutrum tortor. Phasellus et
							elementum elit. Praesent a eleifend orci. Vivamus feugiat augue
							dapibus, euismod quam nec, condimentum elit. Aliquam at tincidunt
							sem, nec ornare lacus. Pellentesque nec tortor neque. In ultrices
							lorem et lorem congue, vitae ullamcorper elit tempor. Nunc varius
							tempus luctus. Aenean consectetur ligula lacus, ac sagittis metus
							dolor.
						</ScrollArea>
					</div>
					<Separator orientation="vertical" className="hidden md:block"/>
					<div className="h-full md:w-[50%] rounded-md  flex flex-col">
						<div
							ref={mapContainer}
							className="map-containerb w-full h-full rounded-md border"
						/>
						<div className="mt-4 flex flex-row gap-2">
							<span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium capitalize text-green-800">
								commercial
							</span>
							<span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium capitalize text-green-800">
								detached
							</span>
							<span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium capitalize text-green-800">
								within a week
							</span>
						</div>
						<Separator className="my-4" />
						<div className="flex flex-row gap-2">
							<Button className="w-full">Bid</Button>
							<Button className="w-full">Request More Info</Button>
						</div>
					</div>
				</CardContent>
				<CardFooter></CardFooter>
			</Card>
		</div>
	);
}
