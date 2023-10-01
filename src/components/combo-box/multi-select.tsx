import React, { useImperativeHandle, useState, forwardRef, Ref } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Icons } from "../icons";
import useComboBox from "@/hooks/use-combo-box";
import { ScrollArea } from "../ui/scroll-area";

export type MultiSelectComboBoxRef = {
	selected: {
		label: string;
		value: string;
	}[];
	totalSelected: number;
};

interface MultiSelectComboBoxProps {
	defaultValue?: string;
	buttonClassName?: string;
	contentClassName?: string;
	options: {
		value: string;
		label: string;
	}[];
	emptyText: string;
	notFoundText: string;
	onSelect?: (value: string) => void;
}

const MultiSelectComboBox = (
	{
		defaultValue,
		buttonClassName,
		contentClassName,
		options,
		emptyText,
		notFoundText,
		onSelect,
	}: MultiSelectComboBoxProps,
	ref: Ref<MultiSelectComboBoxRef>
) => {
	const [open, setOpen] = useState(false);

	const { setValues, selected, totalSelected } = useComboBox();

	useImperativeHandle(ref, () => ({
		selected,
		totalSelected,
	}));
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn(
						"justify-between",
						buttonClassName,
						!totalSelected && "text-muted-foreground"
						)}
						>
					{/* //TODO: Label is not working as intended, only shows epty text */}
					<span className="truncate">
						{totalSelected
							? totalSelected > 1
								? `${totalSelected} selected`
								: selected[0]?.label
							: emptyText}
					</span>
					<Icons.chevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className={contentClassName} asChild align="center">
				<Command>
					<CommandInput placeholder="Search industry..." />
					<CommandEmpty>{notFoundText}</CommandEmpty>
					<CommandGroup className="overflow-auto">
						{options.map((object) => (
							<CommandItem
								key={object.value}
								value={object.value}
								onSelect={(currentValue) => {
									setValues(object.label, object.value);
									onSelect && onSelect(object.value);
								}}
								className="w-full mx-auto"
							>
								<Icons.check
									className={cn(
										"mr-2 h-4 w-4",
										selected.find((s) => s.value === object.value)
											? "opacity-100"
											: "opacity-0"
									)}
								/>
								<span className="text-left">{object.label}</span>
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

export default forwardRef(MultiSelectComboBox);
