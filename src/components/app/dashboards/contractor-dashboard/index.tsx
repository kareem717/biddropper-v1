import React, { ComponentPropsWithoutRef, FC } from "react";
import StatCard from "./stat-card";
import Inbox from "./inbox";

interface ContractorDashboardProps extends ComponentPropsWithoutRef<"div"> {
  userId: string;
}

const ContractorDashboard: FC<ContractorDashboardProps> = ({
  userId,
  ...props
}) => {
  return (
    <div
      className="mx-auto mb-20 grid max-w-[1920px] grid-flow-row-dense gap-2 px-4 pb-4 pt-24 md:gap-6 lg:px-8 lg:pb-8"
      {...props}
    >
      <StatCard />
      <Inbox userId={userId} />
    </div>
  );
};

export default ContractorDashboard;
