"use client";

import React from "react";
import ComboBox from "@/components/combo-box";
import useComboBox from "@/hooks/use-combo-box";
import { industries } from "@/db/config/industries";

export default function CreateJobForm() {
  
	return (
		<div>
			<ComboBox
				options={industries}
				emptyText="Select An Industry"
				notFoundText="No Industry Found"
        contentClassName="overflow-auto max-h-60"
			/>
		</div>
	);
}
