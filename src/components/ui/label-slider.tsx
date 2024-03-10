"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils/shadcn";
import { Input } from "../shadcn/ui/input";

export type LabelSliderRef = {
  getValue: () => number;
}

const LabelSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    label?: string;
  }
>(
  (
    {
      className,
      value: valueProp,
      onValueChange,
      onBlur,
      onFocus,
      label,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = React.useState(
      valueProp || props.defaultValue || props.min || 0,
    );
    const [isEditing, setIsEditing] = React.useState(false);
    const [labelVisible, setLabelVisible] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleValueChange = (newValue: number[]) => {
      setValue(newValue);
      if (onValueChange) onValueChange(newValue);
    };

    const handleDivClick = () => {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleInputBlur = () => {
      setIsEditing(false);
      const inputValue = inputRef.current?.value;
      if (inputValue) {
        let newValue = parseInt(inputValue, 10);

        if (props.max !== undefined && newValue > props.max) {
          newValue = props.max;
        } else if (props.min !== undefined && newValue < props.min) {
          newValue = props.min;
        }

        if (!isNaN(newValue)) {
          handleValueChange([newValue]);
        }
      }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleInputBlur();
      }
    };
    
    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "group relative flex w-full touch-none select-none items-center",
          className,
        )}
        value={Array.isArray(value) ? value : [value]}
        onValueChange={handleValueChange}
        onFocus={(e) => {
          setLabelVisible(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setLabelVisible(false);
          if (onBlur) onBlur(e);
        }}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {isEditing ? (
          <Input
            ref={inputRef}
            type="number"
            className="absolute bottom-full left-1/2 mb-2 w-1/3 -translate-x-1/2 rounded-md bg-background p-2 text-sm shadow-lg"
            defaultValue={Array.isArray(value) ? value[0] : value}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            min={props.min}
            max={props.max}
            step={props.step}
          />
        ) : (
          <div
            tabIndex={0}
            className={cn(
              "absolute bottom-full left-1/2 mb-2 -translate-x-1/2 cursor-pointer rounded-md bg-background p-2 text-sm shadow-lg",
              labelVisible ? "block" : "hidden",
            )}
            onClick={handleDivClick}
          >
            {value}
            {label}
          </div>
        )}
        <SliderPrimitive.Thumb
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleDivClick();
              e.preventDefault();
            }
          }}
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Root>
    );
  },
);
LabelSlider.displayName = SliderPrimitive.Root.displayName;

export { LabelSlider };
