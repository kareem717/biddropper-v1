"use client";

import {
  ResponsiveContainer,
  ResponsiveContainerProps,
  Pie,
  PieChart,
  Tooltip,
} from "recharts";

interface DonutChartProps {
  data: {
    name: string;
    value: number;
  }[];
  responsiveContainerProps?: ResponsiveContainerProps;
}

const DonutChart: React.FC<DonutChartProps> = ({
  responsiveContainerProps,
  data,
}) => {
  return (
    <ResponsiveContainer className="" {...responsiveContainerProps}>
      <PieChart>
        <Pie
          dataKey="value"
          strokeWidth={2}
          data={data}
          className="fill-primary stroke-foreground"
          style={
            {
              stroke: "var(--theme-primary)",
              fill: "var(--theme-primary)",
            } as React.CSSProperties
          }
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-card p-2 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                      {payload[0]?.name}
                    </span>
                    <span className="font-bold text-muted-foreground">
                      {payload[0]?.value}
                    </span>
                  </div>
                </div>
              );
            }

            return null;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChart;
