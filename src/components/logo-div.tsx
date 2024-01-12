import React, { ComponentPropsWithoutRef } from "react";
interface LogoDivProps extends ComponentPropsWithoutRef<"div"> {}

const LogoDiv: React.FC<LogoDivProps> = ({ ...props }) => {
  return (
    <div {...props}>
      <a className="flex flex-row items-baseline" href="/">
        <h1 className="relative flex flex-row items-baseline text-2xl font-bold">
          <span className="sr-only">BidDropper</span>
          <span className="tracking-tight hover:cursor-pointer">
            bid
            <span className="text-primary">dropper</span>
          </span>
          <sup className="absolute left-[calc(100%+.1rem)] top-0 text-xs font-bold">
            [BETA]
          </sup>
        </h1>
      </a>
    </div>
  );
};

export default LogoDiv;
