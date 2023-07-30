import * as React from "react";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CheckIcon } from "@radix-ui/react-icons";
import { SelectProps } from "@radix-ui/react-select";
const groups = [
	{
		label: "Industry",
		items: [
			{
				label: "Lighting",
				value: "lighting",
			},
			{
				label: "Electrical",
				value: "electrical",
			},
			{
				label: "Irrigation",
				value: "irrigation",
			},
			{
				label: "HVAC",
				value: "hvac",
			},
			{
				label: "Plumbing",
				value: "plumbing",
			},
		],
	},
];

interface SelectTradeProps extends SelectProps {
  onValueChange?: (value: string) => void;
}

const SelectTrade: React.FC<SelectTradeProps> = (props) => {
  const handleValueChange = (value: string) => {
    props.onValueChange && props.onValueChange(value);
  };

  return (
    <Select onValueChange={handleValueChange} {...props}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={"Select a trade"} />
      </SelectTrigger>
      <SelectContent>
        {groups.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectTrade;
