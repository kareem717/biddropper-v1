import { Badge } from "./ui/badge";
import { ComponentPropsWithoutRef, FC, ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./ui/tooltip";

interface BadgeTooltipProps extends ComponentPropsWithoutRef<typeof Badge> {
  label: string;
  tooltipContent: ReactNode;
  tooltipProps?: ComponentPropsWithoutRef<typeof Tooltip>;
  tooltipContentProps?: ComponentPropsWithoutRef<typeof TooltipContent>;
  tooltipTriggerProps?: ComponentPropsWithoutRef<typeof TooltipTrigger>;
  tooltipProviderProps?: ComponentPropsWithoutRef<typeof TooltipProvider>;
}

const BadgeTooltip: FC<BadgeTooltipProps> = ({
  label,
  tooltipContent,
  tooltipProps,
  tooltipContentProps,
  tooltipTriggerProps,
  tooltipProviderProps,
  ...props
}) => {
  return (
    <TooltipProvider {...tooltipProviderProps}>
      <Tooltip {...tooltipProps}>
        <TooltipTrigger {...tooltipTriggerProps}>
          <Badge {...props}>{label}</Badge>
        </TooltipTrigger>
        <TooltipContent {...tooltipContentProps}>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BadgeTooltip;
