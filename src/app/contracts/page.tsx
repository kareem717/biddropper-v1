import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { bundles, jobs } from "@/db/schema/posts";
import { eq } from "drizzle-orm";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";

export default async function ContractPage() {
	const res = db.select().from(bundles).prepare();

	const data = await res.execute();

	console.log(data);

	return (
		<main>
			<div className="flex grow">
				<div className="mx-auto flex max-w-7xl grow flex-col bg-white py-6 text-black">
					<div className="flex grow flex-col">
						<ul className="flex  w-full flex-col items-center justify-center gap-2 overflow-y-auto p-6 md:grid md:grid-cols-2 md:gap-0 lg:grid-cols-3">
							{data.map((bundle) => (
								<li className="col-span-1 w-full max-w-sm" key={bundle.id}>
									<div className="flex items-center h-[80px] justify-center px-4 rounded-t-lg py-5 font-bold text-white sm:p-6 bg-cover bg-[url('/images/gradient-filler-01.jpeg')]" />
									<div className="flex grow flex-col space-y-4 bg-gray-50 px-4 py-4 sm:px-6 rounded-b-lg">
										<div className="flex h-full flex-row justify-between">
											<div className="flex flex-col justify-between gap-4">
												<div className="flex w-48 flex-col gap-4">
													{/* Content */}
													<div>
														<p className="pointer-events-none block truncate text-xl font-medium text-gray-900">
															{bundle.title}
														</p>
														<p className="pointer-events-n4one block text-sm font-medium text-gray-500">
															No URL specified
														</p>
													</div>
													{/* <span className="text-lg font-medium">
														9.99MB
														<span className="text-sm text-gray-600">
															{" "}
															/ 2GB (0.5%)
														</span>
													</span> */}
												</div>
												{/* <div className="flex flex-row gap-2">
													<span className="inline-flex items-center rounded-md bg-red-100 px-2.5 py-0.5 text-sm font-medium capitalize text-red-800">
														free
													</span>
													<span className="inline-flex items-center rounded-md bg-red-100 px-2.5 py-0.5 text-sm font-medium capitalize text-red-800">
														Shared Quota
													</span>
												</div> */}
											</div>
											{/* Settings-Gear */}
											<div className="z-10 flex flex-col gap-4">
												<a href="/dashboard/a3md5pq7g0/settings">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 512 512"
														className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-900"
													>
														<path
															fill="currentColor"
															d="M495.9 166.6c3.2 8.7.5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4l-55.6 17.8c-8.8 2.8-18.6.3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4c-1.1-8.4-1.7-16.9-1.7-25.5s.6-17.1 1.7-25.4l-43.3-39.4c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160a80 80 0 1 0 0 160z"
														></path>
													</svg>
												</a>
											</div>
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</main>
	);
}
