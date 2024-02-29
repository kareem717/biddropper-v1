"use client";
import React, { ComponentPropsWithoutRef, FC, useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import SideBar from "@/components/ui/nav-bar/side-bar";
import { Icons } from "@/components/icons";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/ui/avatar";
import { ModeToggle } from "../../shadcn/ui/mode-toggle";
import LogoDiv from "../../logo-div";

interface DashboardPageBoardProps extends ComponentPropsWithoutRef<"nav"> {}

const DashboardPageBoard: FC<DashboardPageBoardProps> = ({ ...props }) => {
  const USER_NAME = "Kareem Yakubu";
  const USER_PROFILE_IMAGE_SOURCE = "https://github.com/shadcn.png";

  const userInitials = USER_NAME.split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  const [isSideBarOpen, setSideBarOpen] = useState<boolean>(false);

  return (
    <nav {...props}>
      <SideBar
        isOpen={isSideBarOpen}
        setIsOpen={() => {
          setSideBarOpen(!isSideBarOpen);
        }}
      />
      <div className="h-14 w-full border-b-2 border-foreground/20 sm:h-16">
        <div className="m-auto flex h-full max-w-[1920px] items-center justify-between sm:px-4 lg:px-10">
          <div className="flex w-1/4 items-center justify-between md:w-[12%]">
            <Button
              onClick={() => {
                setSideBarOpen(!isSideBarOpen);
              }}
              variant={"ghost"}
            >
              <Icons.menu />
            </Button>
            <LogoDiv className="hidden sm:block" />
          </div>
          <div className="flex items-center justify-center gap-4 px-4">
            {/* <span className="hidden md:block">{USER_NAME}</span> */}
            <Avatar className="border-[3px] border-primary">
              <AvatarImage src={USER_PROFILE_IMAGE_SOURCE} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="sm:ml-2">
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardPageBoard;
