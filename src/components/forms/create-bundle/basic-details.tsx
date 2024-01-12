import React from "react";
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
import { Input } from "@/components/ui/input";
import { useMultistepForm } from "@/hooks/use-multistep-form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertBundleSchema } from "@/lib/validations/posts/posts";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Icons } from "@/components/icons";

const formSchema = insertBundleSchema.pick({
  title: true,
  description: true,
  posterType: true,
  bundleType: true,
});

type Inputs = z.infer<typeof formSchema>;

function BasicDetailsForm() {
  const { nextStep, addFormData } = useMultistepForm();

  const form = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      posterType: "property-owner",
      bundleType: "contractor-wanted",
    },
  });

  const formIsSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: Inputs) => {
    addFormData(data);
    nextStep();
  };

  return (
    <Form {...form}>
      <form
        className="mx-1 grid gap-4"
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Full Garage Renovation" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="We are looking to renovate our entire garage..."
                  className="max-h-[300px]"
                />
              </FormControl>
              <FormDescription>
                Explain the the contract in it&#39;s entirety.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`bundleType`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>I&#39;m looking to...</FormLabel>

              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="contractor-wanted" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Find a contractor to handle everything
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="sub-contract" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Subcontract out the work
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`posterType`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>I am a...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="property-owner" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Residential property owner
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="business-owner" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Business owner
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={formIsSubmitting} className="mt-8">
          {formIsSubmitting ? (
            <Icons.spinner
              className="mr-2 h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            "Next"
          )}
          <span className="sr-only">Continue to next page</span>
        </Button>
      </form>
    </Form>
  );
}

export default BasicDetailsForm;
