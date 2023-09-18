//TODO: Cleanup this file
import React, {
	Ref,
	useCallback,
	useImperativeHandle,
	useState,
	forwardRef,
} from "react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { useDropzone } from "react-dropzone";
import type { FileWithPath } from "react-dropzone";
import { generateReactHelpers } from "@uploadthing/react/hooks";
import { generateClientDropzoneAccept } from "uploadthing/client";
import Image from "next/image";
import { AspectRatio } from "./ui/aspect-ratio";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Icons } from "./icons";

export type ImageUploaderRef = {
	upload: () => void;
	files: File[];
};

interface ImageUploaderProps {
	maxFiles?: number;
	showLoadingState?: boolean;
	onClientUploadComplete: (
		res:
			| {
					fileUrl: string;
					fileKey: string;
			  }[]
			| undefined
	) => void;
	onUploadError: (error: Error) => void;
}

// TODO: hide skip button after upload is pressed as it causes bugs
function ImageUploader(
	{
		maxFiles,
		onClientUploadComplete,
		onUploadError,
		showLoadingState,
	}: ImageUploaderProps,
	ref: Ref<ImageUploaderRef>
) {
	const { useUploadThing } = generateReactHelpers<OurFileRouter>();
	const [files, setFiles] = useState<File[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const onDrop = useCallback(
		(acceptedFiles: FileWithPath[]) => {
			setFiles([...files, ...acceptedFiles]);
		},
		[files]
	);

	const handleClientUploadComplete = async (
		res: { fileUrl: string; fileKey: string }[] | undefined
	) => {
		onClientUploadComplete(res);
		setIsUploading(false);
	};

	const handleUploadError = (error: Error) => {
		setIsUploading(false);
		onUploadError(error);
	};

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: "image" ? generateClientDropzoneAccept(["image"]) : undefined,
	});

	const { startUpload } = useUploadThing("strictImageAttachment", {
		onClientUploadComplete: handleClientUploadComplete,
		onUploadError: handleUploadError,
	});

	useImperativeHandle(ref, () => ({
		upload: () => {
			setIsUploading(true);
			startUpload(files);
		},
		files,
	}));

	return (
		<>
			{isUploading && showLoadingState ? (
				<div className="h-[400px] flex justify-center items-center">
					<Icons.spinner className="animate-spin w-1/2 h-1/2 font-thin stroke-[0.5px] opacity-50" />
				</div>
			) : (
				<>
					<div {...getRootProps()}>
						<div className="h-[400px] overflow-scroll flex flex-wrap gap-4 justify-content-center items-center">
							{Array.from({ length: maxFiles || 12 }, (_, index) => {
								const file = files[index];
								return (
									<div
										key={index}
										className="w-[200px] flex-grow border-2 rounded-lg"
									>
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
						<input {...getInputProps()} />
					</div>
				</>
			)}
		</>
	);
}

export default forwardRef(ImageUploader);
