import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface Currency {
	currency: string;
	icon: LucideIcon;
}

interface CurrencyInputProps {
	onChange: (value: number | null) => void;
	max?: number;
	min?: number;
	required?: boolean;
	currencies?: Currency[];
	currencyValue: string;
	onCurrencyChange: (currency: string) => void;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
	onChange,
	max,
	min,
	required,
	currencies = [],
	currencyValue,
	onCurrencyChange,
}) => {
	const [currency, setCurrency] = useState(currencyValue);
	const [inputValue, setInputValue] = useState<number | undefined>(undefined);

	useEffect(() => {
		setCurrency(currencyValue);
	}, [currencyValue]);

	// TODO: Allows infinite zero-inputs after decimal point
	const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.target.value;
		
		if (newValue === "") {
			setInputValue(undefined);
			onChange(null);
		} else {
			const parsedValue = Number(parseFloat(newValue).toFixed(2));

			setInputValue(parsedValue);
			onChange(parsedValue);
		}
	};

	const handleCurrencyChange = (newCurrency: string) => {
		setCurrency(newCurrency);
		onCurrencyChange(newCurrency.toLowerCase());
	};

	const selectedCurrency = currencies.find((c) => c.currency === currency);
	return (
		<div className="flex items-center space-x-2">
			{selectedCurrency?.icon && <selectedCurrency.icon />}
			<Input
				type="number"
				className={cn(
					"flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
					required && "required"
				)}
				value={inputValue}
				onChange={handleValueChange}
				max={max}
				min={min}
				required={required}
			/>
			<Select
				value={currency}
				onValueChange={(event) => handleCurrencyChange(event)}
			>
				<SelectTrigger className="w-1/3 truncate">
					<SelectValue placeholder="Select a currency" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Currencies</SelectLabel>
						{currencies.map((c) => (
							<SelectItem key={c.currency} value={c.currency}>
								{c.currency}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
};
export default CurrencyInput;
