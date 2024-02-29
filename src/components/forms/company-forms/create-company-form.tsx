"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/shadcn/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/ui/form";
import { Input } from "@/components/shadcn/ui/input";
import { bodyParamSchema } from "@/lib/validations/api/(content)/jobs/request";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { Session } from "next-auth";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import CustomRadioButtons from "@/components/custom-radio-buttons";
import { Icons } from "@/components/icons";
import { Calendar } from "@/components/shadcn/ui/calendar";
import { cn } from "@/lib/utils/shadcn";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import { Label } from "@/components/shadcn/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/shadcn/ui/radio-group";
import { format } from "date-fns";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import AddressInput from "@/components/maps/features/address-input";
import ImageDropzone from "@/components/image-dropzone";
import { useToast } from "@/components/shadcn/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import useAddressInput from "@/hooks/use-address-input";
import useImageDropzone from "@/hooks/use-image-dropzone";
import { useCreateJob } from "@/hooks/api/jobs/use-create-job";
import { ToastAction } from "@/components/shadcn/ui/toast";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { createJobInput } from "@/server/api/validations/jobs";
import RadiusAddressMap from "@/components/maps/radius-address-map";
import useRadiusMap from "@/hooks/use-radius-map";
interface CreateCompanyFormProps extends ComponentPropsWithoutRef<typeof Card> {
  session: Session;
}

const formSchema = createJobInput;

const CreateCompanyForm: React.FC<CreateCompanyFormProps> = ({
  session,
  ...props
}) => {
  const {address, radius} = useRadiusMap();
 
  

  return (
    <div className="animate-border inline-block w-full max-w-screen-md rounded-[var(--radius)] bg-gradient-to-r from-primary/70 via-secondary to-primary/70 bg-[length:400%_400%] p-1 drop-shadow-xl">
      <Card>
        <CardHeader>
          <CardTitle>Create a company</CardTitle>
          <CardDescription>
            Enter the details of the company you want to create, and we will
            help you get started.
          </CardDescription>
        </CardHeader>
        <CardContent aria-disabled>
          <ScrollArea className="h-[50vh]">
            <RadiusAddressMap />
          </ScrollArea>
        </CardContent>
        <CardFooter className="mt-4 w-full">
          <Button
            // disabled={isPosting}
            className="w-full"
            type="button"
            // onClick={() => {
            //   form.handleSubmit(onSubmit)();
            // }}
          >
            {/* {isPosting ? (
              <span className="flex items-center justify-center gap-2">
                <Icons.loader className="h-5 w-5 animate-spin" />
                <span className="hidden sm:block">Posting...</span>
              </span>
            ) : ( */}
            Post Job
            {/* )} */}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateCompanyForm;
