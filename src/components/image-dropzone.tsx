import React, { FC, useEffect } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import { Input } from "./shadcn/ui/input";
import Image from "next/image";
import { Card } from "./shadcn/ui/card";
import { Icons } from "./icons";
import useImageDropzone from "@/hooks/use-image-dropzone";
import { cn } from "@/lib/utils/shadcn";
import { Button } from "./shadcn/ui/button";
import { ScrollArea, ScrollBar } from "@/components/shadcn/ui/scroll-area";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/shadcn/ui/carousel";

interface ImageDropzoneProps extends React.ComponentPropsWithoutRef<"div"> {
  dropzoneOptions?: DropzoneOptions;
}

const ImageDropzone: FC<ImageDropzoneProps> = ({
  className,
  dropzoneOptions,
  ...props
}) => {
  const { files, addFiles, removeFiles } = useImageDropzone();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg"],
      "image/jpg": [".jpg"],
    },
    ...dropzoneOptions,
    onDrop: (acceptedFiles, ...onDropProps) => {
      addFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );

      if (dropzoneOptions?.onDrop) {
        dropzoneOptions?.onDrop(acceptedFiles, ...onDropProps);
      }
    },
    onDropRejected: (fileRejections, event) => {
      const tooManyFilesRejections = fileRejections.filter((rejection) =>
        rejection.errors.some((error) => error.code === "too-many-files"),
      );
      if (tooManyFilesRejections.length > 0) {
        const firstFiles = tooManyFilesRejections
          .slice(0, dropzoneOptions?.maxFiles)
          .map((rejection) => rejection.file);

        addFiles(
          firstFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            }),
          ),
        );
      }

      if (dropzoneOptions?.onDropRejected) {
        dropzoneOptions?.onDropRejected(fileRejections, event);
      }
    },
  });

  const thumbs = files.map((file: any) => (
    <CarouselItem
      className={cn(
        "relative mb-8 inline-flex aspect-square",
        files.length > 2 && "md:basis-1/3",
      )}
      key={file.name}
    >
      <div className="flex min-w-0 overflow-hidden p-1 ">
        <Button
          variant={"link"}
          className="absolute left-0 top-0 z-20 flex-shrink-0 text-primary/80 hover:text-red-600"
          type="button"
        >
          <Icons.close
            className="h-[20px] w-[20px] stroke-[3px] "
            onClick={() => {
              removeFiles(file);
            }}
          />
        </Button>
        <Image
          src={file.preview}
          fill
          objectFit="cover"
          objectPosition="center"
          alt="Selected photo preview m-4"
          className="z-0 border-2 border-primary/80 hover:opacity-75"
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>
    </CarouselItem>
  ));

  useEffect(() => {
    return () =>
      files.forEach((file: any) => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <div className={cn("container ", className)} {...props}>
      {files.length > 0 && (
        <Carousel
          opts={{
            align: "start",
          }}
          className={cn(
            "mx-auto w-full",
            files.length > 2 ? "max-w-lg" : "max-w-sm",
          )}
        >
          <CarouselContent className="m-0 gap-2">{thumbs}</CarouselContent>
          <CarouselPrevious type="button" />
          <CarouselNext type="button" />
        </Carousel>
      )}

      <div {...getRootProps({ className: "dropzone" })}>
        <Card className="flex h-[100px] w-full flex-col items-center justify-center bg-background">
          <div className="flex flex-col items-center justify-center gap-2">
            <Icons.upload className="text-muted-foreground" />
            <p className="hidden text-sm text-muted-foreground sm:block">
              Drag &#39;n&#39; drop some files here, or click to select files
            </p>
          </div>
          <Input {...getInputProps()} />
        </Card>
      </div>
    </div>
  );
};

export default ImageDropzone;
