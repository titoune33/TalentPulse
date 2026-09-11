"use client";

import { useEffect } from "react";
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
  // Controllers are NOT bundled by default: without them Chart.js throws
  // `"doughnut" is not a registered controller` at runtime and the whole page
  // crashes. Register every controller this app actually renders.
  LineController,
  BarController,
  DoughnutController,
  type ChartData,
  type ChartOptions,
  type ChartType,
} from "chart.js";
import { Chart as ReactChart } from "react-chartjs-2";

ChartJS.register(
  LineController,
  BarController,
  DoughnutController,
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

/** Single source of truth for chart colours — matches the design tokens. */
export const chartPalette = {
  accent: "#1A43C4",
  accentSoft: "rgba(26, 67, 196, 0.08)",
  muted: "#D5D2C8",
  ink: "#14161A",
  ink3: "#82868E",
  grid: "#EDEBE5",
  danger: "#B3261E",
  warn: "#B4711B",
  ok: "#0B6B4F",
} as const;

let fontsApplied = false;

function applyChartFonts() {
  if (fontsApplied || typeof window === "undefined") return;
  const family =
    getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() ||
    "system-ui, sans-serif";
  ChartJS.defaults.font.family = family;
  ChartJS.defaults.font.size = 11;
  ChartJS.defaults.color = chartPalette.ink3;
  ChartJS.defaults.borderColor = chartPalette.grid;
  fontsApplied = true;
}

const defaults: Record<string, any> = {
  color: chartPalette.ink3,
  borderColor: chartPalette.grid,
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        boxWidth: 6,
        boxHeight: 6,
        color: chartPalette.ink3,
        padding: 18,
        font: { size: 11 },
      },
    },
    tooltip: {
      backgroundColor: chartPalette.ink,
      titleColor: "#FFFFFF",
      bodyColor: "#E6E4DD",
      padding: 10,
      cornerRadius: 6,
      displayColors: false,
      titleFont: { size: 11, weight: "600" as const },
      bodyFont: { size: 12 },
    },
  },
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
  useEffect(() => {
    applyChartFonts();
  }, []);

  return (
    <div style={{ height }} className="w-full">
      <ReactChart
        type={type}
        data={data}
        options={
          {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 500, easing: "easeOutQuart" },
            ...defaults,
            ...options,
          } as ChartOptions
        }
      />
    </div>
  );
}
