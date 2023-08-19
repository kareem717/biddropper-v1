// 'use server';
import React from "react";
import { useMultistepForm } from "@/hooks/use-multistep-form";
import ImageUploader from "@/components/image-uploader";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

function StepTwo() {
	const { nextStep, addFormData } = useMultistepForm();

	const onClientUploadComplete = (
		res:
			| {
					fileUrl: string;
					fileKey: string;
			  }[]
			| undefined
	) => {
		addFormData({ images: res });
		toast.success("Images uploaded successfully");
		nextStep();
	};

	const onUploadError = (error: Error) => {
		toast.error("Error uploading images", {
			description: error.message,
		});
	};

	return (
		<div>
			<ImageUploader
				onClientUploadComplete={onClientUploadComplete}
				onUploadError={onUploadError}
			/>
			<Button onClick={nextStep} variant={"secondary"} className="w-full">
				Skip{" "}
				<span>
					<Icons.chevronRight />
				</span>
			</Button>
		</div>
	);
}

export default StepTwo;
