import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "./ui/button";
import { Input } from "./ui/input";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { useImperativeHandle, forwardRef, useState, Ref } from "react";

interface SelectAddProps {
	dialogProps?: Partial<React.ComponentProps<typeof Dialog>>;
	popoverProps?: Partial<React.ComponentProps<typeof Popover>>;
	commandProps?: Partial<React.ComponentProps<typeof Command>>
}

const groups = [
	{
		label: "Industry",
		items: [
			{
				label: "Lighting",
				value: "lighting",
			},
		],
	},
];

const formSchema = z.object({
	tradeName: z
		.string()
		.min(2, { message: "The trade's name must be 2 or more characters long" })
		.max(90, { message: "The trade's name must be 100 or less characters" })
		.regex(RegExp(/^(?! )[a-zA-Z\s]*(?<! )$/), {
			message:
				"The trade's name must only contain letters, and spaces. No leading or trailing spaces.",
		})
		.transform((val) => val.trim()),
});

const SelectAdd = (
	{ dialogProps, popoverProps, commandProps}: SelectAddProps,
	ref: Ref<{ getTrade: () => string }>
) => {
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [showDialog, setShowDialog] = useState(false);
	const [trade, setTrade] = useState("");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			tradeName: "",
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
		setTrade(values.tradeName);
		setShowDialog(false);
		setPopoverOpen(false);
		form.reset();
	}

	useImperativeHandle(ref, () => ({
		getTrade: () => trade,
	}));

	return (
		<div>
			<Dialog {...dialogProps} open={showDialog} onOpenChange={setShowDialog}>
				<Popover
					{...popoverProps}
					open={popoverOpen}
					onOpenChange={setPopoverOpen}
				>
					<PopoverTrigger className={buttonVariants({ variant: "outline" })}>
						{trade || "Select or Add"}
					</PopoverTrigger>
					<PopoverContent>
						<Command {...commandProps}>
							<CommandInput placeholder="Type a command or search..." />
							<CommandEmpty>No results found.</CommandEmpty>

							<CommandList>
								{groups.map((group) => (
									<CommandGroup key={group.label} heading={group.label}>
										{group.items.map((item) => (
											<CommandItem
												key={item.value}
												onSelect={() => {
													setTrade(item.label);
												}}
												className="text-sm"
											>
												{item.label}
												<CheckIcon
													className={cn(
														"ml-auto h-4 w-4",
														trade === item.label ? "opacity-100" : "opacity-0"
													)}
												/>
											</CommandItem>
										))}
									</CommandGroup>
								))}
							</CommandList>

							<CommandSeparator />

							<CommandList>
								<CommandGroup heading="Other">
									<DialogTrigger asChild>
										<CommandItem
											onSelect={() => {
												setPopoverOpen(false);
												setShowDialog(true);
											}}
										>
											<PlusCircledIcon className="w-5 h-5 mr-2" />
											Create New Trade
										</CommandItem>
									</DialogTrigger>
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>

				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Trade Industry</DialogTitle>
						<DialogDescription>
							Add a new trade that you want to find contracters for.
						</DialogDescription>
					</DialogHeader>

					<div>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-8"
							>
								<FormField
									control={form.control}
									name="tradeName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Trade Name</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</form>
						</Form>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setShowDialog(false)}>
							Cancel
						</Button>
						<Button onClick={form.handleSubmit(onSubmit)}>Add</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default forwardRef(SelectAdd);
