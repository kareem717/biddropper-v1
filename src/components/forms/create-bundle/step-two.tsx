import React, { useCallback, useState } from "react";
import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { useMultistepForm } from "@/hooks/use-multistep-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBundleSchema } from "@/lib/validations/posts";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDropzone } from "react-dropzone";
import type { FileWithPath } from "react-dropzone";

import { generateClientDropzoneAccept } from "uploadthing/client";
import ImageUploader from "@/components/image-uploader";
function StepTwo() {
	return (
		<div>
			<ImageUploader />
		</div>
	);
}

export default StepTwo;
