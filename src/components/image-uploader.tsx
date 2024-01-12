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
import { cn } from "@/lib/utils";

export type ImageUploaderRef = {
  upload: () => Promise<
    | {
        fileUrl: string;
        fileKey: string;
      }[]
    | undefined
  >;
  files: File[];
};

interface ImageUploaderProps extends React.ComponentPropsWithoutRef<"div"> {
  maxFiles?: number;
  showLoadingState?: boolean;
  onClientUploadComplete: (
    res:
      | {
          fileUrl: string;
          fileKey: string;
        }[]
      | undefined,
  ) => void;
  onUploadError: (error: Error) => void;
  spinnerClassName?: string;
}

// TODO: hide skip button after upload is pressed as it causes bugs
//TODO: able to upload more files than allowed
function ImageUploader(
  {
    maxFiles,
    onClientUploadComplete,
    onUploadError,
    showLoadingState,
    className,
    spinnerClassName,
    ...props
  }: ImageUploaderProps,
  ref: Ref<ImageUploaderRef>,
) {
  const { useUploadThing } = generateReactHelpers<OurFileRouter>();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFiles([...files, ...acceptedFiles]);
    },
    [files],
  );

  const handleClientUploadComplete = async (
    res: { fileUrl: string; fileKey: string }[] | undefined,
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

  useImperativeHandle(
    ref,
    () => ({
      upload: async () => {
        console.log("uploading");
        setIsUploading(true);
        const upload = await startUpload(files);
        return upload;
      },
      files,
    }),
    [setIsUploading, startUpload, files],
  );

  return (
    <div className={className}>
      {isUploading && showLoadingState ? (
        <div
          className={cn(" flex items-center justify-center", spinnerClassName)}
          {...props}
        >
          <Icons.spinner className="h-1/2 w-1/2 animate-spin stroke-[0.5px] font-thin opacity-50" />
        </div>
      ) : (
        <div>
          <div {...getRootProps()}>
            <div className={cn("justify-content-center items-center")}>
              {Array.from({ length: maxFiles || 10 }, (_, index) => {
                const file = files[index];
                return (
                  <div key={index} className="w-full rounded-lg border-2">
                    <AspectRatio ratio={16 / 9}>
                      {file ? (
                        <Image
                          src={URL.createObjectURL(file)}
                          fill={true}
                          alt={file.name}
                        />
                      ) : (
                        <Skeleton className="h-full w-full" />
                      )}
                    </AspectRatio>
                  </div>
                );
              })}
            </div>
            <input {...getInputProps()} />
          </div>
        </div>
      )}
    </div>
  );
}

export default forwardRef(ImageUploader);
