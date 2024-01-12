// "use client";
import React, { FunctionComponent, useState } from "react";
import Navbar from "@/components/admin-nav-bar";
import StatCard from "./stat-card";
import Inbox from "./inbox";
import { Icons } from "../icons";
import CustomActiveShapePieChart from "../charts/donut-chart";
import { Card } from "../ui/card";

const DashboardPageBoard: FunctionComponent = () => {
  const USER_NAME = "Kareem Yakubu";

  return (
    <main className="h-full w-full">
      <div className=" relative h-full w-full ">
        <Navbar className="fixed top-0 z-30 w-full bg-card/50 backdrop-blur-md" />
        <div className="md: mx-auto mb-20 mt-12 flex max-h-screen max-w-[1920px] flex-col gap-2 p-4 md:gap-6 lg:p-8">
          <StatCard />
          <Inbox />
        </div>
      </div>
    </main>
  );
};

export default DashboardPageBoard;
