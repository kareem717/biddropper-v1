import React, { FunctionComponent } from "react";
import StatCard from "./stat-card";
import Inbox from "./inbox";

const UserDashboard: FunctionComponent = () => {
  return (
    <div className="md: mx-auto mb-20 mt-12 flex max-h-screen max-w-[1920px] flex-col gap-2 p-4 md:gap-6 lg:p-8">
      <StatCard />
      <Inbox />
    </div>
  );
};

export default UserDashboard;
