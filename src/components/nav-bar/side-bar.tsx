"use client";

import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import LogoDiv from "../logo-div";

interface DashboardSideBarProps {
  isOpen: boolean;
  setIsOpen: () => void;
}

const DashboardSideBar: React.FC<DashboardSideBarProps> = ({
  isOpen,
  setIsOpen,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side={"left"}
        className="flex w-4/5 flex-col items-start gap-9 px-2.5 py-[2vh] sm:w-[min(20vw,255px)]  bg-card"
      >
        <div className="flex w-full flex-col items-start px-4 sm:px-8 ">
          <LogoDiv />
          <div className="flex flex-col space-y-3 pt-6">
            <h4 className="font-medium">Listings</h4>
            <a className="text-muted-foreground" href="#">
              Jobs
            </a>
            <a className="text-muted-foreground" href="#">
              Contracts
            </a>
          </div>

          <div className="flex flex-col space-y-3 pt-6">
            <h4 className="font-medium">Offers & Requests</h4>
            <a className="text-muted-foreground" href="#">
              Bids
            </a>
            <a className="text-muted-foreground" href="#">
              Information Requests
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DashboardSideBar;
