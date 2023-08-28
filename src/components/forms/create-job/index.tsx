"use client";

import React from "react";
import useMultistepForm from "@/hooks/use-multistep-form";
import ComboBox from "@/components/combo-box";
import useComboBox from "@/hooks/use-combo-box";
export default function CreateJobForm() {
	const { nextStep, prevStep } = useMultistepForm();
	const { value } = useComboBox();
	console.log(value);
	const testOptions = [
		{ value: "one", label: "1d" },
		{ value: "two", label: "2" },
		{ value: "three", label: "3" },
		{ value: "four", label: "4" },
	];

	return (
		<div>
			<ComboBox
				options={testOptions}
				emptyText="Select plz"
				notFoundText="NOt found"
			/>
		</div>
	);
}
