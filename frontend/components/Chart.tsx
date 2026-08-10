"use client";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
  type ChartType,
} from "chart.js";
import { Chart as ReactChart } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

const defaults: Record<string, any> = {
  color: "#64748b",
  borderColor: "#e2e8f0",
  font: { family: "inherit", size: 12 },
};

export function Chart({
  type,
  data,
  options,
  height = 280,
}: {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ReactChart
        type={type}
        data={data}
        options={{ responsive: true, maintainAspectRatio: false, ...defaults, ...options }}
      />
    </div>
  );
}
