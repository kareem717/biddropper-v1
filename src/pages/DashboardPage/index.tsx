import { FunctionComponent } from "react";
import DashboardPageMenu from "./components/DashboardPageMenu";
import DashboardPageBoard from "./components/DashboardPageBoard";
import classes from "./DashboardPage.module.scss";

const DashboardPage: FunctionComponent = () => {
  return (
    <main className={classes.Dashboard}>
      <DashboardPageMenu />
      <DashboardPageBoard />
    </main>
  );
};

export default DashboardPage;
