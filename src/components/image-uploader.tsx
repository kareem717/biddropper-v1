import React, { useCallback, useState } from "react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { useMultistepForm } from "@/hooks/use-multistep-form";
import { useDropzone } from "react-dropzone";
import type { FileWithPath } from "react-dropzone";
import { generateReactHelpers } from "@uploadthing/react/hooks";
import { generateClientDropzoneAccept } from "uploadthing/client";
import Image from "next/image";
import { UploadDropzone } from "@uploadthing/react";
import { HorizontalScrollArea, ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "./ui/aspect-ratio";
import { Skeleton } from "./ui/skeleton";

function ImageUploader() {
	const { useUploadThing } = generateReactHelpers<OurFileRouter>();
	const { nextStep, addFormData } = useMultistepForm();
	const [files, setFiles] = useState<File[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const onDrop = useCallback(
		(acceptedFiles: FileWithPath[]) => {
			setFiles([...files, ...acceptedFiles]);
		},
		[files]
	);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: "image" ? generateClientDropzoneAccept(["image"]) : undefined,
	});

	const { startUpload } = useUploadThing("strictImageAttachment", {
		onClientUploadComplete: (res) => {
			setIsUploading(false);
			console.log("Files: ", res);
			alert("Upload Completed");
		},
		onUploadError: (error: Error) => {
			// Do something with the error.
			alert(`ERROR! ${error.message}`);
		},
	});

	return (
		<div {...getRootProps()}>
			<ScrollArea className="h-[40vh] md:h-[60vh] px-auto">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{Array.from({ length: 10 }, (_, index) => {
						const file = files[index];
						return (
							<div key={index} className="w-[200px]">
								<AspectRatio ratio={16 / 9}>
									{file ? (
										<Image
											src={URL.createObjectURL(file)}
											fill={true}
											alt={file.name}
										/>
									) : (
										<Skeleton className="w-full h-full" />
									)}
								</AspectRatio>
							</div>
						);
					})}
				</div>
			</ScrollArea>
			<div>
				{files.length > 0 && (
					<button
						onClick={() => {
							setIsUploading(true);
							startUpload(files);
						}}
					>
						Upload {files.length} files
					</button>
				)}
			</div>
			<input {...getInputProps()} />
			Drop files here!
		</div>
	);
}

export default ImageUploader;
