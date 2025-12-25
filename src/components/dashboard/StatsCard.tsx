import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  variant?: "primary" | "success" | "warning" | "default";
  className?: string;
  style?: React.CSSProperties;
}

const StatsCard = ({ title, value, change, icon: Icon, variant = "primary", className, style }: StatsCardProps) => {
  const variants = {
    primary: "stat-card",
    success: "stat-card stat-card-success",
    warning: "stat-card stat-card-warning",
    default: "stat-card",
  };

  return (
    <div className={cn(variants[variant], className)} style={style}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col items-start">
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-xs px-2.5 py-1 rounded-full mb-4",
              "bg-background/20 backdrop-blur-sm"
            )}>
              {change.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{change.isPositive ? "+" : ""}{change.value}%</span>
            </div>
          )}
          <p className="text-5xl font-bold tracking-tight">{value.toLocaleString('ar-EG')}</p>
        </div>
        <div className="text-right">
          {Icon && (
            <div className="w-12 h-12 rounded-xl bg-background/20 backdrop-blur-sm flex items-center justify-center mb-2 animate-float">
              <Icon className="w-6 h-6" />
            </div>
          )}
          <p className="text-sm font-medium opacity-90">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
