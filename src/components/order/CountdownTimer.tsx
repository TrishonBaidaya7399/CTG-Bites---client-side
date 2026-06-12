"use client";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  size?: number;
  color?: string;
}

export function CountdownTimer({
  totalSeconds,
  remainingSeconds,
  size = 80,
  color = "#E8622A",
}: CountdownTimerProps) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const dashOffset = circumference * (1 - progress);

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
  const isUrgent = remainingSeconds < 120;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={5}
          className="text-brand-warm-gray"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isUrgent ? "#ef4444" : color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <span className={cn(
        "absolute font-sans font-bold tabular-nums",
        size < 60 ? "text-xs" : "text-sm",
        isUrgent ? "text-red-500" : "text-brand-brown",
      )}>
        {timeStr}
      </span>
    </div>
  );
}
