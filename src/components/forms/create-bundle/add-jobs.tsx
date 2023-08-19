import React from "react";
import { useMultistepForm } from "@/hooks/use-multistep-form";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import AddJobDialog from "./add-job-dialog";
import { industries } from "@/config/industries";
import { format } from "date-fns";

function AddJobsForm() {
	const { nextStep, formData } = useMultistepForm();
	function toTitleCase(str: string) {
		return str.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	return (
		<div>
			<Table>
				<TableCaption>A list of your bundle&#39;s jobs.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[100px]">Title</TableHead>
						<TableHead>Summary</TableHead>
						<TableHead>Industry</TableHead>
						<TableHead>Property Type</TableHead>
						<TableHead>Date</TableHead>
						<TableHead className="text-right">Budget</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{formData.jobs?.map((job) => {
						const serviceCategory = industries.find(
							(category) => category.value === job.industry
						);
						return (
							<TableRow key={job.title}>
								<TableCell>{toTitleCase(job.title)}</TableCell>
								<TableCell>{toTitleCase(job.summary)}</TableCell>
								<TableCell>{serviceCategory?.label}</TableCell>
								<TableCell>{toTitleCase(job.propertyType)}</TableCell>
								<TableCell>
									{job.dateRange.dateTo ? (
										<>
											{format(job.dateRange.dateFrom, "LLL dd, y")} -{" "}
											{format(job.dateRange.dateTo, "LLL dd, y")}
										</>
									) : (
										format(job.dateRange.dateFrom, "LLL dd, y")
									)}
								</TableCell>
								<TableCell className="text-right">{`${
									job.currencyType === "eur" ? "€" : "$"
								}${job.budget}`}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
			<AddJobDialog />
			{formData.jobs && (
				<Button
					className="w-full mt-2"
					onClick={() => {
						nextStep();
					}}
				>
					Next
				</Button>
			)}
		</div>
	);
}

export default AddJobsForm;
