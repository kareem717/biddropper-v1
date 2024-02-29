import React, { FunctionComponent } from "react";
import StatCard from "./stat-card";
import Inbox from "./inbox";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const ContractorDashboard: FunctionComponent = async () => {
  const userSession = await getServerSession(authOptions);

  if (!userSession) {
    redirect("/login");
  }

  return (
    <div className="mx-auto mb-20 grid max-w-[1920px] grid-flow-row-dense gap-2 pb-4 px-4 pt-24 md:gap-6 lg:pb-8 lg:px-8">
      <StatCard />
      <Inbox session={userSession} />
    </div>
  );
};

export default ContractorDashboard;
