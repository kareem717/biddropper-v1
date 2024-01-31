"use client";
import { ComponentPropsWithoutRef, FC, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertProjectSchema } from "@/lib/validations/posts/projects";
import ImageDropzone, { ImageDropzoneRef } from "@/components/image-dropzone";
import { insertMediaSchema } from "@/lib/validations/posts/posts";
import { insertCompanySchema } from "@/lib/validations/companies";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import CompanySelect from "@/components/select-company";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { toast } from "sonner";
import { insertUserSchema } from "@/lib/validations/entities/user";

const formSchema = z.object({
  title: insertProjectSchema.shape.title,
  details: insertProjectSchema.shape.details,
  companyId: z
    .string()
    .max(50, {
      message: "ID must be at most 50 characters long",
    })
    .regex(/^comp_[A-Za-z0-9\-]+$/, {
      message: "ID must be in the format of comp_[A-Za-z0-9-]+",
    }),
});

const CreateProjectForm: FC<ComponentPropsWithoutRef<"div">> = ({
  ...props
}) => {
  const session = useSession();
  if (!session) {
    redirect("/sign-in");
  }

  const userId = session?.data?.user?.id;
  const userCompanies = session?.data?.user?.ownedCompanies;
  const ImageDropzoneRef = useRef<ImageDropzoneRef>(null);
  const [formStep, setFormStep] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const totalSteps = 2;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      details: "",
      companyId: userCompanies?.length === 1 ? userCompanies[0]?.id : "",
    },
  });

  const handleNextStep = () => {
    setFormStep((prevStep) => {
      if (prevStep < totalSteps - 1) {
        return prevStep + 1;
      } else {
        return prevStep;
      }
    });
  };

  const handlePreviousStep = () => {
    setFormStep((prevStep) => {
      if (prevStep > 0) {
        return prevStep - 1;
      } else {
        return prevStep;
      }
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsFetching(true);
    const uploadedPhotos = await ImageDropzoneRef.current?.upload();

    if (!uploadedPhotos) {
      toast.error("Something went wrong when uploading images!");
      return;
    }

    const req = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...values,
        projectPhotos: uploadedPhotos,
      }),
    });

    if (req.status === 200) {
      toast.success("Project created!");
      console.log(await req.json());
    } else {
      toast.error("Something went wrong!");
    }

    setIsFetching(false);
  }

  return (
    <div {...props}>
      <Form {...form}>
        <Card>
          <CardHeader>
            <CardTitle>Create Project</CardTitle>
            <CardDescription>
              Showcase one of your companies recent projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formStep === 0 && (
              <div className="space-y-6">
                {userCompanies?.length && userCompanies?.length > 1 && (
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Company</FormLabel>
                        <FormControl>
                          <CompanySelect
                            companies={userCompanies}
                            value={form.getValues("companyId")}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Select the company that you want to add this project
                          to.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="max-h-[30vh]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {formStep === 1 && (
              <div>
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
                  className="grid grid-cols-1 gap-4 overflow-auto sm:grid-cols-2 lg:grid-cols-3"
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex w-full gap-2">
              {formStep > 0 && !isFetching && (
                <Button
                  onClick={handlePreviousStep}
                  className="w-full"
                  variant={"secondary"}
                >
                  Back
                </Button>
              )}
              {formStep < totalSteps - 1 && (
                <Button
                  onClick={async () => {
                    await form.trigger(["companyId", "title", "details"]);
                    form.getFieldState("companyId").invalid;

                    if (
                      !form.getFieldState("companyId").invalid &&
                      !form.getFieldState("title").invalid &&
                      !form.getFieldState("details").invalid
                    ) {
                      handleNextStep();
                    }
                  }}
                  className="w-full"
                >
                  Next
                </Button>
              )}
              {formStep === totalSteps - 1 &&
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
                    form="job-form"
                    className="w-full"
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    <span className="hidden sm:block">Finish and Create</span>
                    <span className="sm:hidden">Done</span>
                  </Button>
                ))}
            </div>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
};

export default CreateProjectForm;
