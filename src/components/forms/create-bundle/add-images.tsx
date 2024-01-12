// 'use server';
import React from "react";
import { useMultistepForm } from "@/hooks/use-multistep-form";
import ImageUploader from "@/components/image-uploader";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

function AddImagesForm() {
  const { nextStep, addFormData } = useMultistepForm();

  const onClientUploadComplete = (
    res:
      | {
          fileUrl: string;
          fileKey: string;
        }[]
      | undefined,
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
        className="grid grid-cols-1 gap-4 overflow-auto sm:grid-cols-2 lg:grid-cols-3"
      />
      <Button onClick={nextStep} variant={"outline"} className="mt-3 w-full">
        Skip{" "}
        <span>
          <Icons.chevronRight />
        </span>
      </Button>
    </div>
  );
}

export default AddImagesForm;
