"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { insertCompanySchema } from "@/lib/validations/entities/companies";
import ImageDropzone, { ImageDropzoneRef } from "@/components/image-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Icons } from "../icons";
import { useSession } from "next-auth/react";
import { ComponentPropsWithoutRef, FC, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  insertAddressSchema,
  mapResponseToAddress,
} from "@/lib/validations/references/address";
import RadiusAddress, { RadiusAddressRef } from "../maps/radius-address-map";
import { Textarea } from "../ui/textarea";
import MultiSelectComboBox, {
  MultiSelectComboBoxRef,
} from "../combo-box/multi-select";
import createMultistepFormStore from "@/hooks/use-multistep-form";
import { toast } from "sonner";

const formSchema = insertCompanySchema
  .omit({
    createdAt: true,
    updatedAt: true,
    addressId: true,
    isVerified: true,
    imageId: true,
    ownerId: true,
  })
  .extend({
    address: insertAddressSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    }),
  });

export type Inputs = z.infer<typeof formSchema>;

const industryFetcher = (url: string) =>
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

const useMultistepForm = createMultistepFormStore(4, {
  0: ["name", "dateEstablished"],
  1: ["emailAddress", "phoneNumber", "websiteUrl"],
  2: ["address", "serviceArea"],
  3: ["products", "services", "specialties"],
});

const CreateCompanyForm: FC<ComponentPropsWithoutRef<"div">> = ({
  ...props
}) => {
  const router = useRouter();
  const session = useSession();
  if (!session) {
    router.replace("/sign-in");
  }
  const ImageDropzoneRef = useRef<ImageDropzoneRef>(null);
  const comboRef = useRef<MultiSelectComboBoxRef>(null);
  const radiusMapRef = useRef<RadiusAddressRef>(null);
  const userId = session.data?.user?.id;
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const {
    nextStep,
    prevStep,
    step: formStep,
    isLastStep: isLastFormStep,
    validateStep,
  } = useMultistepForm();

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: `comp_${crypto.randomUUID()}`,
      name: undefined,
      dateEstablished: new Date(),
      emailAddress: undefined,
      websiteUrl: undefined,
      phoneNumber: undefined,
      address:
        mapResponseToAddress(radiusMapRef?.current?.address) || undefined,
      serviceArea: String(radiusMapRef?.current?.radius) || undefined,
      products: "",
      services: "",
      specialties: "",
    },
  });

  const onSubmit = async (data: Inputs) => {
    setIsFetching(true);

    // upload image
    const uploadSuccess = await ImageDropzoneRef?.current?.upload();
    if (!uploadSuccess && ImageDropzoneRef?.current?.files?.length) {
      toast.error("Image upload failed", {
        action: {
          label: "Retry",
          onClick: () => {
            // Retry the upload or continue the onSubmit function
            form.handleSubmit((data: any) => onSubmit(data as Inputs));
          },
        },
      });

      setIsFetching(false);
      return;
    }

    const reqBody = {
      ...data,
      ownerId: userId,
      industries: comboRef?.current?.selected,
      image: uploadSuccess?.[0] || undefined,
    };

    console.log(reqBody);
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    });

    if (res.ok) {
      toast.success("Company created successfully");
      router.push(`/company/${reqBody.id}`);
    } else {
      toast.error("Company creation failed");
    }
  };

  const { data: industries, error: industryFetchError } = useSWR(
    "/api/industries",
    industryFetcher,
  );

  if (industryFetchError) {
    return <div>Something went wrong</div>;
  }

  if (!industries) {
    return <div>Loading...</div>;
  }

  return (
    <div {...props}>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create your company</CardTitle>
          <CardDescription>
            Register your company to find future leadsdf
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            {/* Step 1 */}
            {formStep === 0 && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateEstablished"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel>Date Established</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Step 2 */}
            {formStep === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Website </FormLabel>
                      <FormControl>
                        {/* {//todo: fix as any} */}
                        <Input {...(field as any)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Step 3 */}
            {/* Have to simply hide image uploader component with css or else not able to upload the images once the component is not rendered */}
            <div className={cn(formStep !== 2 && "hidden")}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Image</FormLabel>
                    <FormControl>
                      <div>
                        {/* //TODO: implement the uploading functionality */}
                        <ImageDropzone
                          onClientUploadComplete={(
                            res:
                              | {
                                  fileUrl: string;
                                  fileKey: string;
                                }[]
                              | undefined,
                          ) => {
                            console.log(res);
                          }}
                          onUploadError={(err) => {
                            console.log(err);
                          }}
                          ref={ImageDropzoneRef}
                          maxFiles={1}
                          className="max-h-[20vh] overflow-hidden"
                          spinnerClassName="max-h-[20vh] overflow-hidden"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {formStep === 2 && (
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Address</FormLabel>
                      <FormControl>
                        <RadiusAddress
                          maxRadius={500}
                          onRetrieve={(val) => {
                            const address = mapResponseToAddress(val);
                            if (address) {
                              form.setValue("address", address);
                            } else {
                              form.setError("address", {
                                type: "manual",
                                message:
                                  "An error occurred while retrieving the address.",
                              });
                            }
                          }}
                          onRadiusChange={(val) => {
                            form.setValue("serviceArea", String(val));
                          }}
                          className="h-[40vh]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Step 4 */}
            {formStep === 3 && (
              <>
                <MultiSelectComboBox
                  options={industries}
                  emptyText="Select company industries..."
                  notFoundText="No industries found."
                  ref={comboRef}
                  contentClassName="max-h-[20vh]"
                />

                <FormField
                  control={form.control}
                  name="products"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Products</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          className="max-h-[15vh]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Services</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          className="max-h-[15vh]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specialties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialties</FormLabel>
                      <FormDescription>
                        What does your company specialize in?
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          className="max-h-[15vh]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </Form>
        </CardContent>
        <CardFooter>
          <div className="flex w-full gap-2">
            {formStep > 0 && !isFetching && (
              <Button
                onClick={prevStep}
                className="w-full"
                variant={"secondary"}
              >
                Back
              </Button>
            )}
            {!isLastFormStep() && (
              <Button
                onClick={async () => {
                  const step = await validateStep(formStep, form);
                  if (step) {
                    nextStep();
                  }
                }}
                className="w-full"
              >
                Next
              </Button>
            )}
            {isLastFormStep() &&
              (isFetching ? (
                <Button disabled={true} type={"button"} className="w-full">
                  <Icons.spinner
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Loading</span>
                </Button>
              ) : (
                <Button
                  type="submit"
                  form="company-form"
                  className="w-full"
                  onClick={form.handleSubmit((data: any) =>
                    onSubmit(data as Inputs),
                  )}
                >
                  <span className="hidden sm:block">Finish and Create</span>
                  <span className="sm:hidden">Done</span>
                </Button>
              ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateCompanyForm;
