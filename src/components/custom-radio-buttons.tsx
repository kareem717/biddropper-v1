import { ComponentPropsWithoutRef, useState } from "react";
import { Icons } from "./icons";
import { cn } from "@/lib/utils/shadcn";
import { Label } from "./shadcn/ui/label";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

interface CustomRadioButtonsProps
  extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  buttons: Array<{
    icon: (typeof Icons)[keyof typeof Icons];
    label: string;
    value: string;
  }>;
  onValueChange?: (value: string) => void;
  className?: string;
  itemProps?: ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>;
}

const CustomRadioButtons: React.FC<CustomRadioButtonsProps> = ({
  buttons,
  itemProps,
  ...props
}) => {
  const [selectedValue, setSelectedValue] = useState<string | undefined>();

  const handleButtonClick = (value: string) => {
    setSelectedValue(value);
    if (props.onValueChange) {
      props.onValueChange(value);
    }
  };

  return (
    <RadioGroupPrimitive.Root {...props} onValueChange={handleButtonClick}>
      {buttons.map((button) => (
        <div
          className={cn(
            "my-2 flex aspect-square h-full w-full flex-col items-center gap-2 text-muted-foreground hover:text-foreground",
            button.value === selectedValue && "text-primary hover:text-primary",
          )}
          key={button.value}
        >
          <RadioGroupPrimitive.Item
            {...itemProps}
            className="h-full w-full"
            value={button.value}
          >
            <div
              className={cn(
                "flex h-full w-full items-center justify-center rounded-full bg-secondary",
                selectedValue === button.value &&
                  "border-[min(4vw,4px)] border-primary/60",
              )}
              onClick={() => handleButtonClick(button.value)}
            >
              <button.icon
                id={button.value}
                className={cn(
                  "h-[60%] w-[60%] stroke-[1px]",
                  selectedValue === button.value && "stroke-primary",
                )}
              />
            </div>
            <Label htmlFor={button.value} className="text-[12px] sm:text-lg ">
              {button.label}
            </Label>
          </RadioGroupPrimitive.Item>
        </div>
      ))}
    </RadioGroupPrimitive.Root>
  );
};

export default CustomRadioButtons;
