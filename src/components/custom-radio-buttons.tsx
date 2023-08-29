import { useState } from "react";
import { Icons } from "./icons";
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
		<div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-10", className)}>
			{buttons.map((button) => (
				<div key={button.value} className="aspect-square">
					<div
						className={`bg-secondary rounded-full flex justify-center items-center w-full h-full ${
							selectedValue === button.value ? "border-[min(4vw,6px)] sm:border-8 xl:border-[12px] border-primary" : ""
						}`}
						onClick={() => handleButtonClick(button.value)}
					>
						<button.icon className=" w-[60%] h-[60%] stroke-[1.5px]" />
					</div>
					<div
						className="w-full flex justify-center text-base sm:text-lg lg:text-2xl"
					>
						{button.label}
					</div>
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
	);
};

export default CustomRadioButtons;
