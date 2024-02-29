// "use client";
import LineChart from "../../charts/line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "../../shadcn/ui/card";
import SimpleBarChart from "../../charts/simple-bar-chart";
import DonutChart from "../../charts/donut-chart";

const dummyData1 = Array.from({ length: 10 }, (_, i) => ({
  name: `Item ${i + 1}`,
  v1: Math.floor(Math.random() * 100),
  v2: Math.floor(Math.random() * 100),
}));

const dummyData2 = Array.from({ length: 10 }, (_, i) => ({
  name: `Item ${i + 1}`,
  v1: Math.floor(Math.random() * 100),
  v2: Math.floor(Math.random() * 100),
}));

const dummyData3 = Array.from({ length: 4 }, (_, i) => ({
  name: `Item ${i + 1}`,
  value: Math.floor(Math.random() * 100),
}));

const StatCard: React.FC = ({ ...props }) => {
  return (
    <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-3 md:gap-6 [&>*]:aspect-video ">
      <Card>
        <CardHeader className="items-left flex flex-col justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-normal">Subscriptions</CardTitle>
          <div>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+180.1%</span> from last quarter
            </p>
          </div>
        </CardHeader>
        <CardContent className="h-full w-full pb-4">
          <LineChart data={dummyData2} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="items-left flex flex-col justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-normal">Subscriptions</CardTitle>
          <div>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-12</span> from last quarter
            </p>
          </div>
        </CardHeader>
        <CardContent className="h-full w-full pb-4">
          <SimpleBarChart data={dummyData1} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="items-left flex flex-col justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-normal">Subscriptions</CardTitle>
          <div>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+180.1%</span> from last quarter
            </p>
          </div>
        </CardHeader>
        <CardContent className="h-full w-full pb-4">
          <DonutChart data={dummyData3} />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatCard;
