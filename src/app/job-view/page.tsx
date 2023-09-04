"use client";
import dynamic from "next/dynamic";

// This will load the component dynamically and show a loading text while it's loading

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import "mapbox-gl/dist/mapbox-gl.css";
import React from "react";
import { Separator } from "@/components/ui/separator";

// Import Swiper styles
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const ImageSlider = dynamic(() => import("@/components/image-slider"), {
	loading: () => <Skeleton className="rounded-md border overflow-hidden" />,
	ssr: false, // This line is important. It disables server-side rendering for the component
});

const JobMap = dynamic(() => import("@/components/job-map"), {
	loading: () => (
		<Skeleton className="w-full h-[30vh] md:h-full rounded-md border" />
	),
	ssr: false, // This line is important. It disables server-side rendering for the component
});

export default function JobView() {
	const images = [
		"https://images.unsplash.com/photo-1590004953392-5aba2e72269a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
		"https://images.unsplash.com/photo-1590004845575-cc18b13d1d0a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
		"https://images.unsplash.com/photo-1590004987778-bece5c9adab6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
		"https://images.unsplash.com/photo-1590005176489-db2e714711fc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
	];

	return (
		<div className="w-full h-screen bg-[url('/images/blob-scene.svg')] bg-cover relative xl:bg-bottom">
			<Card className="sm:w-[min(80vw,1250px)] w-[95vw]  bg-background absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4">
				<CardHeader>
					<CardTitle>Job Title</CardTitle>
				</CardHeader>
				<ScrollArea className="max-h-[70vh]">
					<CardContent className="flex flex-col md:flex-row h-[70vh] w-full items-center justify-between md:space-x-6 ">
						<div className="h-full md:w-[50%] rounded-md grid grid-rows-2 gap-4">
							{
								<ImageSlider
									images={images}
									className="rounded-md border overflow-hidden"
									swiperProps={{
										className: "w-full h-full",
									}}
								/>
							}
							<ScrollArea className="rounded-md border p-4">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
								a diam purus. Interdum et malesuada fames ac ante ipsum primis
								in faucibus. Suspendisse hendrerit viverra dapibus. Nunc
								ullamcorper est neque, a mollis mi suscipit quis. Duis libero
								erat, interdum et nunc eget, commodo feugiat augue. Quisque
								volutpat lectus ex, vel consectetur leo luctus non. Ut aliquet
								condimentum mauris. In suscipit et lectus sed mollis. In sed
								scelerisque est. Pellentesque habitant morbi tristique senectus
								et netus et malesuada fames ac turpis egestas. Vivamus consequat
								dui a diam interdum imperdiet. Maecenas fringilla dictum odio,
								eu interdum magna viverra nec. Proin fermentum in nisl sed
								aliquet. Vestibulum ultricies lobortis venenatis. Morbi et erat
								vitae nibh congue pellentesque vitae scelerisque massa. Nam
								malesuada ex eu fringilla faucibus. Duis ullamcorper, turpis
								quis vestibulum cursus, lacus neque accumsan velit, non
								dignissim diam metus in elit. In in porta mauris. Aliquam in
								suscipit nulla, a malesuada quam. Pellentesque sed erat rhoncus,
								lacinia lectus eu, blandit diam. Vivamus laoreet posuere tellus
								sit amet euismod. Praesent eu risus orci. Nullam et nisl
								gravida, cursus mauris eu, elementum nisi. Donec pellentesque
								dui ante. Nunc efficitur iaculis leo ac mollis. Nulla rutrum,
								dui ac venenatis interdum, nisl diam congue ante, sit amet
								convallis leo est vel diam. Cras in posuere nunc, quis euismod
								diam. Donec ullamcorper interdum lacus in imperdiet. Morbi
								interdum blandit lectus, bibendum gravida lectus tincidunt a.
								Donec facilisis tortor ac tortor auctor, quis congue libero
								gravida. Suspendisse non sem ut velit ultricies accumsan.
								Suspendisse placerat semper porta. Integer gravida sit amet diam
								at porta. Duis ut diam a risus facilisis mattis id lobortis
								dolor. Praesent volutpat venenatis urna eu malesuada.
								Suspendisse lobortis auctor erat vel sollicitudin. Nam eget
								massa nec erat iaculis vulputate eget quis risus. Aliquam
								posuere libero arcu, eget luctus purus vehicula maximus. Vivamus
								vitae magna consectetur, rhoncus lectus sed, bibendum neque.
								Nulla semper nulla non lectus varius tristique. Curabitur mattis
								pellentesque velit, a ultricies leo faucibus quis. Suspendisse
								euismod, justo mollis facilisis gravida, ipsum elit euismod
								mauris, nec pulvinar enim diam sed felis. Quisque id condimentum
								enim. Praesent eleifend metus eu tempus interdum. Quisque ornare
								id risus vel sodales. Lorem ipsum dolor sit amet, consectetur
								adipiscing elit. Nulla hendrerit velit magna, sit amet accumsan
								sem tincidunt sed. Phasellus id lectus vel turpis pellentesque
								tristique. Praesent eu mi ultrices, eleifend quam quis, rutrum
								tortor. Phasellus et elementum elit. Praesent a eleifend orci.
								Vivamus feugiat augue dapibus, euismod quam nec, condimentum
								elit. Aliquam at tincidunt sem, nec ornare lacus. Pellentesque
								nec tortor neque. In ultrices lorem et lorem congue, vitae
								ullamcorper elit tempor. Nunc varius tempus luctus. Aenean
								consectetur ligula lacus, ac sagittis metus dolor.
							</ScrollArea>
						</div>
						<Separator orientation="vertical" className="hidden md:block" />
						<Separator className="my-4 md:hidden" />
						<div className="h-full md:w-[50%] w-full rounded-md  flex flex-col">
							{
								<JobMap
									className="w-full rounded-md border h-[30vh] md:h-full"
									zoom={15}
									lng={-79.1536063}
									lat={44.0433684}
								/>
							}
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
								<span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium capitalize text-green-800">
									9 bids
								</span>
							</div>
							<Separator className="my-4 hidden md:block" />
							<div className="flex flex-row gap-2 mt-4 md:mt-0">
								<Button className="w-full">Bid</Button>
								<Button className="w-full">Request More Info</Button>
							</div>
						</div>
					</CardContent>
				</ScrollArea>
				<CardFooter></CardFooter>
			</Card>
		</div>
	);
}
