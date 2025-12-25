import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  title: string;
  icon: LucideIcon;
  to: string;
  className?: string;
  style?: React.CSSProperties;
}

const ActionCard = ({ title, icon: Icon, to, className, style }: ActionCardProps) => {
  return (
    <Link to={to} className={cn("action-card flex flex-col items-center gap-5 text-center group", className)} style={style}>
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary/80 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl relative overflow-hidden">
        <Icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-all duration-300 relative z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </div>
      <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">{title}</span>
    </Link>
  );
};

export default ActionCard;
