import React, { FunctionComponent } from "react";
import StatCard from "./stat-card";
import Inbox from "./inbox";

const UserDashboard: FunctionComponent = () => {
  return (
    <div className="mx-auto mb-20 grid max-w-[1920px] grid-flow-row-dense gap-2 px-4 pb-4 pt-24 md:gap-6 lg:px-8 lg:pb-8">ccbv
      <StatCard />
      <Inbox />
    </div>
  );
};

export default UserDashboard;
