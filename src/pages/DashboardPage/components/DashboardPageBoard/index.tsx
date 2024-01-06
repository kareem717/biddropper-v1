import React, { FunctionComponent } from "react";
import classes from "./DashboardPageBoard.module.scss";

const DashboardPageBoard: FunctionComponent = () => {
  const calendar = [
    { day: "Sun", date: 1 },
    { day: "Mon", date: 2 },
    { day: "Tue", date: 3 },
    { day: "Wed", date: 4 },
    { day: "Thu", date: 5 },
    { day: "Fri", date: 6 },
    { day: "Sat", date: 7 },
  ];

  const schedule = [
    {
      date: "Wed, 11 Jan",
      time: "09:30 AM",
      title: "Business Analytics Press",
      participants: "David Mvguire and 20+ more",
    },
    {
      date: "Wed, 11 Jan",
      time: "09:30 AM",
      title: "Business Analytics Press",
      participants: "David Mvguire and 20+ more",
    },
    {
      date: "Wed, 11 Jan",
      time: "09:30 AM",
      title: "Business Analytics Press",
      participants: "David Mvguire and 20+ more",
    },
    {
      date: "Wed, 11 Jan",
      time: "09:30 AM",
      title: "Business Analytics Press",
      participants: "David Mvguire and 20+ more",
    },
    {
      date: "Wed, 11 Jan",
      time: "09:30 AM",
      title: "Business Analytics Press",
      participants: "David Mvguire and 20+ more",
    },
    {
      date: "Wed, 11 Jan",
      time: "09:30 AM",
      title: "Business Analytics Press",
      participants: "David Mvguire and 20+ more",
    },
    {
      date: "Wed, 11 Jan",
      time: "09:30 AM",
      title: "Business Analytics Press",
      participants: "David Mvguire and 20+ more",
    },
    {
      date: "Wed, 11 Jan",
      time: "09:30 AM",
      title: "Business Analytics Press",
      participants: "David Mvguire and 20+ more",
    },
  ];

  return (
    <main className={classes.Board}>
      <div className={classes.Board__head}>
        <div className={classes.Board__head__left}>
          <h1>
            Hello, <span>User!</span>
          </h1>
          <p>Here&apos;s your overview of your business!</p>
        </div>
        <div className={classes.Board__head__right}>
          <img src="https://placehold.co/45" alt="" />
          <img src="https://placehold.co/45" alt="" />
          <div className={classes.user}>
            <img src="https://placehold.co/45" alt="" />
            <div>
              <p>user name</p>
              <p>useremail@email.com</p>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.Board__stats}>
        <div className={classes.Board__stats__stat}>
          <p className={classes.head}>
            total customers <img src="https://placehold.co/35" alt="" />
          </p>
          <span className={classes.number}>21.753</span>
          <p className={classes.stat}>
            <span>+15%</span> from the past month
          </p>
        </div>
        <div className={classes.Board__stats__stat}>
          <p className={classes.head}>
            active customers <img src="https://placehold.co/35" alt="" />
          </p>
          <span className={classes.number}>21.753</span>
          <p className={classes.stat}>
            <span>+15%</span> from the past month
          </p>
        </div>
        <div className={classes.Board__stats__stat}>
          <p className={classes.head}>
            total profit <img src="https://placehold.co/35" alt="" />
          </p>
          <span className={classes.number}>21.753</span>
          <p className={classes.stat}>
            <span>+15%</span> from the past month
          </p>
        </div>
        <div className={classes.Board__stats__stat}>
          <p className={classes.head}>
            total expense <img src="https://placehold.co/35" alt="" />
          </p>
          <span className={classes.number}>21.753</span>
          <p className={classes.stat}>
            <span>+15%</span> from the past month
          </p>
        </div>
      </div>
      <div className={classes.Board__main}>
        <div className={classes.Board__main_left}>
          <div className={classes.Board__main__child}>
            <div className={classes.head}>
              <p>sales overview</p>
              <div className={classes.head__options}>
                <button>opt</button>
              </div>
            </div>
            <img src="/images/graph.png" alt="" />
          </div>
          <div className={classes.Board__main__child}>
            <div className={classes.head}>
              <p>unknown stats</p>
              <div className={classes.head__options}>
                <button>opt</button>
              </div>
            </div>
            <div className={classes.unknown}>
              <div className={classes.unknown__left}>
                <p>Desktop Users</p>
                <h4>31.12%</h4>
                <div className={classes.bar}></div>
                <p>-15% from the last month</p>
              </div>
              <div className={classes.unknown__right}>
                <p>Mobile Users</p>
                <h4>62.88%</h4>
                <div className={classes.bar}></div>
                <p>-15% from the last month</p>
              </div>
            </div>
          </div>
        </div>
        <div className={classes.Board__main_right}>
          <div className={classes.Board__main__child}>
            <div className={classes.head}>
              <p>calendar</p>
              <div className={classes.head__options}>
                <button>opt</button>
                <button>opt</button>
              </div>
            </div>
            <div className={classes.calendar}>
              {calendar.map((cal, i) => (
                <>
                  <div className={classes.calendar__day}>
                    <span>{cal.day}</span>
                    <span>{cal.date}</span>
                  </div>
                </>
              ))}
            </div>
          </div>

          <div className={classes.Board__main__child}>
            <div className={classes.head}>
              <p>upcoming shcedule</p>
              <div className={classes.head__options}>
                <button>opt</button>
              </div>
            </div>
            <div className={classes.schedule}>
              {schedule.map((sche, i) => (
                <div className={classes.schedule__event} key={i}>
                  <input type="checkbox" name="" id="" />
                  <div className={classes.schedule__time}>
                    <span>{sche.date}</span>
                    <span>{sche.time}</span>
                  </div>
                  <div className={classes.schedule__desc}>
                    <span>{sche.title}</span>
                    <span>{sche.participants}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPageBoard;
