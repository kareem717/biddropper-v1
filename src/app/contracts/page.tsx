import * as React from "react";
import { db } from "@/db";
import { bundles } from "@/db/migrations/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

//TODO: can thus be cone with zustand/react-query?
export default async function ContractPage() {
	const res = db.select().from(bundles).prepare();

	const session = await getServerSession(authOptions);

	if (!session) {
		redirect("/");
	}

	const ownedCompanies = session.user.ownedCompanies;

	if (!ownedCompanies) {
		redirect("/");
	}

	const data = await res.execute();

	console.log(data);

	return (
		<main>
			<div className="flex grow">
				<div className="mx-auto flex max-w-7xl grow flex-col bg-white py-6 text-black">
					<div className="flex grow flex-col">
						<ul className="flex  w-full flex-col items-center justify-center gap-5 overflow-y-auto p-6 md:grid md:grid-cols-2 lg:grid-cols-3">
							{data.map((bundle) => (
								<li
									className="col-span-1 w-full max-w-sm over flow-hidden"
									key={bundle.id}
								>
									<div className="flex items-center h-[80px] justify-center px-4 rounded-t-lg py-5 font-bold text-white sm:p-6 bg-cover bg-[url('/images/gradient-filler-01.jpeg')]" />
									<div className="flex grow flex-col space-y-4 bg-gray-50 px-4 py-4 sm:px-6 rounded-b-lg">
										<div className="flex h-full flex-row justify-between">
											<div className="flex flex-col justify-between gap-4">
												<div className="flex flex-col gap-4">
													{/* Content */}
													<p className="pointer-events-none block truncate text-xl h-[85px] font-medium capitalize text-gray-900 whitespace-pre-line overflow-hidden">
														{bundle.title}
													</p>
													<p className="pointer-events-none block text-sm h-[100px] overflow-hidden font-medium text-gray-500 whitespace-pre-line">
														{bundle.description}
													</p>
												</div>
												{/* Tags */}
												<div className="flex flex-row gap-2">
													{bundle.isActive ? (
														<span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium capitalize text-green-800">
															active
														</span>
													) : (
														<span className="inline-flex items-center rounded-md bg-red-100 px-2.5 py-0.5 text-sm font-medium capitalize text-red-800">
															closed
														</span>
													)}
												</div>
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
