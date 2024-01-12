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
    <div className={cn("grid grid-cols-1 gap-10 sm:grid-cols-2", className)}>
      {buttons.map((button) => (
        <div key={button.value} className="aspect-square">
          <div
            className={`flex h-full w-full items-center justify-center rounded-full bg-secondary ${
              selectedValue === button.value
                ? "border-[min(4vw,6px)] border-primary sm:border-8 xl:border-[12px]"
                : ""
            }`}
            onClick={() => handleButtonClick(button.value)}
          >
            <button.icon className=" h-[60%] w-[60%] stroke-[1.5px]" />
          </div>
          <div className="flex w-full justify-center text-base sm:text-lg lg:text-2xl">
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
