"use client";
import { Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts";

interface SimpleBarChartProps {
  data: {
    name: string;
    v1: number;
    v2: number;
  }[];
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 0,
        }}
      >
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-card p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {payload[0]?.name}
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0]?.value}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {payload[1]?.name}
                      </span>
                      <span className="font-bold">{payload[1]?.value}</span>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          }}
        />
        <Bar
          dataKey="v1"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
        <Bar
          dataKey="v2"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-foreground"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SimpleBarChart;
