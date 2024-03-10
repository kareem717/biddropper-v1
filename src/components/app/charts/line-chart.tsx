"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  ResponsiveContainerProps,
  Tooltip,
} from "recharts";

interface LineChartGraphProps {
  data: {
    name: string;
    v1: number;
    v2: number;
  }[];
  responsiveContainerProps?: ResponsiveContainerProps;
}

const LineChartGraph: React.FC<LineChartGraphProps> = ({
  responsiveContainerProps,
  data,
}) => {
  return (
    <ResponsiveContainer {...responsiveContainerProps}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 10,
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
        <Line
          type="monotone"
          strokeWidth={2}
          dataKey="v1"
          activeDot={{
            r: 6,
            style: { fill: "var(--theme-primary)", opacity: 0.35 },
          }}
          className="stroke-primary"
          style={
            {
              stroke: "var(--theme-primary)",
              opacity: 0.5,
            } as React.CSSProperties
          }
        />
        <Line
          type="monotone"
          dataKey="v2"
          strokeWidth={2}
          activeDot={{
            r: 8,
            style: { fill: "var(--theme-primary)" },
          }}
          className="stroke-primary"
          style={
            {
              stroke: "var(--theme-primary)",
            } as React.CSSProperties
          }
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartGraph;
