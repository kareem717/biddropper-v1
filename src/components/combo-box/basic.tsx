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
import { useState } from "react";

interface ComboBoxProps {
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

const ComboBox: React.FC<ComboBoxProps> = ({
  defaultValue,
  buttonClassName,
  contentClassName,
  options,
  emptyText,
  notFoundText,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || "");
  const { setValues } = useComboBox();

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
            !value && "text-muted-foreground",
          )}
        >
          <span className="truncate">
            {value
              ? options.find((object) => object.value === value)?.label
              : emptyText}
          </span>
          <Icons.chevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={contentClassName} asChild align="center">
        <Command>
          <CommandInput placeholder="Search industry..." />
          <CommandEmpty>{notFoundText}</CommandEmpty>
          <CommandGroup>
            {options.map((object) => (
              <CommandItem
                key={object.value}
                value={object.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setValues(object.label, object.value);
                  onSelect && onSelect(object.value);
                  setOpen(false);
                }}
                className="mx-auto w-full"
              >
                <Icons.check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === object.value ? "opacity-100" : "opacity-0",
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

export default ComboBox;
