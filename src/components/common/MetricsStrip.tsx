import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { OverviewMetric } from "#/services/overview";
import { cn } from "#/lib/utils";

const TONE_ACCENT: Record<OverviewMetric["tone"], string> = {
  neutral: "text-foreground",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
};

const SPARK_STROKE: Record<OverviewMetric["tone"], string> = {
  neutral: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
};

function Sparkline({ points, stroke }: { points: number[]; stroke: string }) {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const path = points
    .map((value, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 28 - ((value - min) / range) * 24 - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-7 w-full" aria-hidden>
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function MetricsStrip({ metrics }: { metrics: OverviewMetric[] }) {
  return (
    <div
      className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8"
      data-testid="overview-metrics-strip"
    >
      {metrics.map((metric) => {
        const TrendIcon =
          metric.trend === "up" ? ArrowUpRight : metric.trend === "down" ? ArrowDownRight : Minus;
        return (
          <Link
            key={metric.key}
            to={metric.href}
            data-testid={`metric-${metric.key}`}
            className="group rounded-lg border border-hairline bg-surface-1 px-3 py-2.5 transition-colors duration-150 hover:border-primary/35 hover:bg-surface-2 focus-ring"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[11px] font-medium text-muted-foreground">{metric.label}</p>
              <TrendIcon
                className={cn(
                  "h-3 w-3 shrink-0",
                  metric.trend === "up" ? "text-success" : metric.trend === "down" ? "text-destructive" : "text-muted-foreground",
                )}
              />
            </div>
            <p className={cn("num mt-1 font-display text-lg font-semibold leading-none", TONE_ACCENT[metric.tone])}>
              {metric.value}
            </p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">{metric.delta}</p>
            <Sparkline points={metric.spark} stroke={SPARK_STROKE[metric.tone]} />
          </Link>
        );
      })}
    </div>
  );
}
