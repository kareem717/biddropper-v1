import React, { FunctionComponent } from "react";
import classes from "./DashboardPageMenu.module.scss";

const DashboardPageMenu: FunctionComponent = () => {
  return (
    <menu className={classes.Menu}>
      <div className={classes.Menu__head}>
        <div>
          <img src="https://placehold.co/30" alt="" />
          <span>Biddropper</span>
        </div>
        <button>opt</button>
      </div>
      <div className={classes.Menu__search}>Search here...</div>

      <div className={classes.Menu__main}>
        <p>main menu</p>
        <button className={classes.Menu__button}>Statistics</button>
        <button className={classes.Menu__button}>Jobs</button>
        <button className={classes.Menu__button}>Contracts</button>
      </div>
      <div className={classes.Menu__settings}>
        <p>settings</p>
        <button className={classes.Menu__button}>Statistics</button>
        <button className={classes.Menu__button}>Jobs</button>
        <button className={classes.Menu__button}>Contracts</button>
      </div>
    </menu>
  );
};

export default DashboardPageMenu;
