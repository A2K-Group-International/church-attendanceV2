import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "../../shadcn/card";
import { ChartContainer, ChartTooltipContent } from "../../shadcn/chart";

const chartData = [
    { month: "January",  children: 80 },
    { month: "February", children: 200 },
    { month: "March",  children: 120 },
    { month: "April", children: 190 },
    { month: "May",  children: 130 },
    { month: "June", children: 140 },
  ];

const chartConfig = {
  children: {
    label: "Children",
    color: "hsl(var(--chart-2))",
  },
};

export default function AdminChart() {
  return (
    <main className="p-4 lg:p-8">
      <div>
        <h1 className="text-lg font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monthly attendance data.
        </p>
      </div>

      <div className="mt-8 w-full lg:mt-0 lg:w-1/2">
        <Card>
          <CardHeader>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Legend />
                  <Bar
                    dataKey="children"
                    fill={chartConfig.children.color}
                    name={chartConfig.children.label}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Showing total attendance for the last 6 months
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
