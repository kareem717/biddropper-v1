"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
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
import { Input } from "@/components/shadcn/ui/input";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { Session } from "next-auth";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import CustomRadioButtons from "@/components/custom-radio-buttons";
import { Icons } from "@/components/icons";
import { Calendar } from "@/components/shadcn/ui/calendar";
import { cn } from "@/lib/utils/shadcn";
import { Label } from "@/components/shadcn/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/shadcn/ui/radio-group";
import { format } from "date-fns";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import ImageDropzone from "@/components/image-dropzone";
import { useToast } from "@/components/shadcn/ui/use-toast";
import useImageDropzone from "@/hooks/use-image-dropzone";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { createJobInput } from "@/server/api/validations/jobs";
import AutoFillMap from "@/components/maps/autofill-map";
import { ToastAction } from "@/components/shadcn/ui/toast";
import useAutoFillMap from "@/hooks/use-auto-fill-map";

interface CreateJobFormProps extends ComponentPropsWithoutRef<"div"> {
  session: Session;
}

const formSchema = createJobInput;

const CreateJobForm: React.FC<CreateJobFormProps> = ({
  session,
  className,
  ...props
}) => {
  const { files } = useImageDropzone();
  const { data: industries } = api.industry.getIndustries.useQuery();
  const ownedCompanies = session.user.ownedCompanies;
  const { toast } = useToast();
  const router = useRouter();
  const [isPosting, setIsPosting] = useState(false);
  const { address: mapAddress } = useAutoFillMap();

  const { mutateAsync: createJob } = api.job.createJob.useMutation({
    onMutate: (e) => {
      setIsPosting(true);
    },
  });

  const { setValue, ...form } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: !ownedCompanies.length ? session.user.id : undefined,
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      startDateFlag: "none",
      base64Images: [],
    },
  });

  useEffect(() => {
    if (mapAddress) {
      setValue("address", mapAddress);
    }
  }, [mapAddress, setValue]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isPosting) return;
    setIsPosting(true);

    const base64Images = await Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }),
    );

    await createJob(
      {
        ...values,
        base64Images,
      },
      {
        onError: (err) => {
          toast({
            title: "Uh oh! Something went wrong.",
            description: err.message,
            action: (
              <ToastAction
                onClick={() => {
                  form.handleSubmit(onSubmit)();
                }}
                altText="Retry"
              >
                Retry
              </ToastAction>
            ),
          });

          setIsPosting(false);
        },
        onSuccess: () => {
          form.reset();
          toast({
            title: "Success!",
            description: "Your job has been created and posted.",
          });
          router.push(`/jobs`);

          setIsPosting(false);
        },
      },
    );
  }

  return (
    <div
      className={cn(
        "animate-border inline-block w-full max-w-screen-md rounded-[var(--radius)] bg-gradient-to-r from-primary/70 via-secondary to-primary/70 bg-[length:400%_400%] p-1 drop-shadow-xl",
        className,
      )}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>Create a job</CardTitle>
          <CardDescription>
            Post a job you want done, when posted contractors will be able to
            see it and bid on it.
          </CardDescription>
        </CardHeader>
        <CardContent aria-disabled>
          <ScrollArea className="h-[50vh]">
            <Form {...form} setValue={setValue}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mx-1 space-y-8"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input maxLength={100} {...field} />
                      </FormControl>
                      <FormDescription>
                        <span className="text-muted-foreground">
                          ({`${field.value?.length || 0}/100`})
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-background"
                          maxLength={3000}
                        />
                      </FormControl>
                      <FormDescription>
                        <span className="text-muted-foreground">
                          ({`${field.value?.length || 0}/3000`})
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormDescription>
                        Which one of these industries is the most relevant to
                        this job? Leave this empty if you&#39;re not sure and
                        we&#39;ll match you with a professional for you based on
                        the job description.
                      </FormDescription>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || undefined}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel className="text-muted-foreground">
                                Industries
                              </SelectLabel>
                              {industries ? (
                                industries.map((industry: any) => (
                                  <SelectItem
                                    key={industry.value}
                                    value={industry.value}
                                  >
                                    {industry.label}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="m-auto flex items-center justify-center gap-1">
                                  <Icons.dot
                                    className="h-6 w-6 animate-pulse text-muted-foreground"
                                    aria-hidden="true"
                                  />
                                  <Icons.dot
                                    className="h-6 w-6 animate-pulse text-muted-foreground"
                                    aria-hidden="true"
                                  />
                                  <Icons.dot
                                    className="h-6 w-6 animate-pulse text-muted-foreground"
                                    aria-hidden="true"
                                  />
                                </div>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {ownedCompanies.length === 1 ? (
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field: { value } }) => (
                      <FormItem>
                        <FormControl>
                          <div className="items-top flex space-x-2">
                            <Checkbox
                              id="terms1"
                              onCheckedChange={(val) => {
                                setValue(
                                  "companyId",
                                  val ? ownedCompanies[0]?.id : undefined,
                                );
                                setValue(
                                  "userId",
                                  val ? undefined : session.user.id,
                                );
                              }}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor="terms1"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Is this a company job?
                              </label>
                              <p className="text-sm text-muted-foreground">
                                Do you want the owning party of this job to be{" "}
                                {ownedCompanies[0]?.name}?
                              </p>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : ownedCompanies.length > 1 ? (
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner</FormLabel>
                        <FormDescription>
                          Select who the owner of this job is. If you select one
                          of the company names you own, then this job will be
                          owned by that company. If you select your name, then
                          this job will be owned by you.
                        </FormDescription>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              if (value === "") {
                                setValue("userId", session.user.id);
                                setValue("companyId", undefined);
                              } else {
                                setValue("userId", undefined);
                                setValue("companyId", value);
                              }
                            }}
                            defaultValue={field.value || undefined}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Company Name" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel className="text-muted-foreground">
                                  Users
                                </SelectLabel>
                                <SelectItem key={"default"} value={""}>
                                  {session.user.name}
                                </SelectItem>
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel className="text-muted-foreground">
                                  Companies
                                </SelectLabel>
                                {session.user.ownedCompanies.map((company) => (
                                  <SelectItem
                                    key={company.name}
                                    value={company.id}
                                  >
                                    {company.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : undefined}
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <FormDescription>
                        Which one of these porperty types is closest to the
                        property this job for?
                      </FormDescription>
                      <FormControl>
                        <CustomRadioButtons
                          {...field}
                          className="mx-auto my-6 flex h-full w-full max-w-md flex-row items-center justify-between gap-8"
                          onValueChange={(value) => {
                            setValue("propertyType", value as any);
                          }}
                          buttons={[
                            {
                              icon: Icons.home as any,
                              label: "Detached",
                              value: "detached",
                            },
                            {
                              icon: Icons.building as any,
                              label: "Apartment",
                              value: "apartment",
                            },
                            {
                              icon: Icons.building2 as any,
                              label: "Semi-Detached",
                              value: "semi-detached",
                            },
                          ]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isCommercialProperty"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="items-top flex space-x-2">
                          <Checkbox
                            id="commercial"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor="commercial"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Is this a commercial property?
                            </label>
                            <p className="text-sm text-muted-foreground">
                              If this property is used to conduct business, or
                              is owned by a business, then select this option.
                            </p>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startDateFlag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>When do you want this job to start?</FormLabel>
                      <FormControl>
                        <FormControl>
                          <RadioGroup
                            defaultValue={field.value}
                            onValueChange={(val) => {
                              field.onChange(val);
                              if (val !== "none") {
                                setValue("startDate", null);
                              }
                            }}
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <div className="items-top flex space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="none" id="none" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  <div className="grid gap-1.5 leading-none">
                                    <Label
                                      htmlFor="none"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Around this date
                                    </Label>
                                    <FormField
                                      control={form.control}
                                      name="startDate"
                                      render={({ field: subField }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Popover>
                                              <PopoverTrigger
                                                asChild
                                                disabled={
                                                  field.value !== "none"
                                                }
                                              >
                                                <FormControl>
                                                  <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                      "w-[240px] pl-3 text-left font-normal",
                                                      !subField.value &&
                                                        "text-muted-foreground",
                                                    )}
                                                  >
                                                    {subField.value ? (
                                                      format(
                                                        subField.value,
                                                        "PPP",
                                                      )
                                                    ) : (
                                                      <span>Pick a date</span>
                                                    )}
                                                    <Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
                                                  </Button>
                                                </FormControl>
                                              </PopoverTrigger>
                                              <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                              >
                                                <Calendar
                                                  mode="single"
                                                  selected={
                                                    subField.value || undefined
                                                  }
                                                  onSelect={(date) => {
                                                    if (
                                                      field.value !== "none"
                                                    ) {
                                                      subField.onChange(date);
                                                    } else {
                                                      subField.onChange(null);
                                                    }
                                                  }}
                                                  disabled={(date) =>
                                                    date < new Date()
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
                                  </div>
                                </FormLabel>
                              </div>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <div className="items-top flex space-x-2">
                                <FormControl>
                                  <RadioGroupItem
                                    value="flexible"
                                    id="flexible"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  <div className="grid gap-1.5 leading-none">
                                    <Label
                                      htmlFor="flexible"
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Flexible
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      I don&#39;t have a specific date in mind,
                                      and am flexible on when this job can be
                                      done.
                                    </p>
                                  </div>
                                </FormLabel>
                              </div>
                            </FormItem>

                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <div className="items-top flex space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="urgent" id="urgent" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  <div className="grid gap-1.5 leading-none">
                                    <Label
                                      htmlFor="urgent"
                                      className="font-me`dium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Urgently
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      I need this job done as soon as possible,
                                      and I am willing to pay a premium to get
                                      it done.
                                    </p>
                                  </div>
                                </FormLabel>
                              </div>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormDescription>
                        Please select an address from the suggestions below.
                      </FormDescription>
                      <FormControl className="mt-2">
                        <AutoFillMap />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="base64Images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Images</FormLabel>
                      <FormDescription>
                        Add up to 5 images to be included in your job posting.
                      </FormDescription>
                      <FormControl>
                        <ImageDropzone
                          dropzoneOptions={{
                            accept: {
                              "image/png": [".png"],
                              "image/jpeg": [".jpeg"],
                              "image/jpg": [".jpg"],
                            },
                            maxFiles: 5,
                            maxSize: 5 * 1024 * 1024,

                            onDropRejected(fileRejections, event) {
                              fileRejections.forEach((fileRejection) => {
                                fileRejection.errors.forEach((error) => {
                                  form.setError("base64Images", {
                                    type: "value",
                                    message: error.message,
                                  });
                                });
                              });
                            },
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </ScrollArea>
        </CardContent>
        <CardFooter className="mt-4 w-full">
          <Button
            disabled={isPosting}
            className="w-full"
            type="button"
            onClick={() => {
              form.handleSubmit(onSubmit)();
            }}
          >
            {isPosting ? (
              <span className="flex items-center justify-center gap-2">
                <Icons.loader className="h-5 w-5 animate-spin" />
                <span className="hidden sm:block">Posting...</span>
              </span>
            ) : (
              "Post Job"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateJobForm;
