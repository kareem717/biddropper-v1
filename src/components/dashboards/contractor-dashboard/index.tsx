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
    <div className="mx-auto mb-20 mt-12 flex max-h-screen max-w-[1920px] flex-col gap-2 p-4 md:gap-6 lg:p-8">
      <StatCard />
      <Inbox session={userSession}/>
    </div>
  );
};

export default ContractorDashboard;
