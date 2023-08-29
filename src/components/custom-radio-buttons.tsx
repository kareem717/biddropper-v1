import { useState } from "react";
import { Icons } from "./icons";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

interface CustomRadioButtonsProps {
	buttons: Array<{
		icon: (typeof Icons)[keyof typeof Icons];
		label: string;
		value: string;
	}>;
	onValueChange?: (value: string) => void;
	className?: string;
}

const CustomRadioButtons: React.FC<CustomRadioButtonsProps> = ({
	buttons,
	onValueChange,
	className,
}) => {
	const [selectedValue, setSelectedValue] = useState("");

	const handleButtonClick = (value: string) => {
		setSelectedValue(value);
		if (onValueChange) {
			onValueChange(value);
		}
	};

	return (
		<div className={cn("mx-auto", className)}>
			<div className="grid grid-cols-2 gap-10">
				{buttons.map((button) => (
					<div key={button.value} className="aspect-square">
						<div
							className={`bg-secondary rounded-full flex justify-center items-center w-full h-full ${
								selectedValue === button.value ? "border-8 border-primary" : ""
							}`}
							onClick={() => handleButtonClick(button.value)}
						>
							<button.icon className=" w-[60%] h-[60%] stroke-[1.5px]" />
						</div>
						<Label
							htmlFor={button.value}
							className="w-full flex justify-center text-2xl mt-3"
						>
							{button.label}
						</Label>
						<input
							type="radio"
							id={button.value}
							name="propertyType"
							value={button.value}
							className="sr-only"
							checked={selectedValue === button.value}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default CustomRadioButtons;
