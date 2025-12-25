import { User, Check, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  id: string;
  title: string;
  sender: string;
  senderInitial: string;
  preview: string;
  date: string;
  isRead: boolean;
  onMarkAsRead?: () => void;
}

const NotificationItem = ({ title, sender, senderInitial, preview, date, isRead, onMarkAsRead }: NotificationItemProps) => {
  return (
    <div
      className={cn(
        "flex items-start gap-4 p-5 rounded-2xl transition-all duration-500 relative overflow-hidden cursor-pointer group",
        isRead 
          ? "bg-gradient-to-l from-primary/10 via-primary/5 to-transparent hover:from-primary/15" 
          : "bg-card hover:bg-muted/50 border border-border hover:border-primary/30 hover:shadow-lg"
      )}
    >
      {/* Timeline indicator */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300",
        isRead 
          ? "bg-gradient-to-b from-primary to-primary/50" 
          : "bg-gradient-to-b from-primary via-primary/80 to-primary/50 group-hover:shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
      )} />
      
      {/* Date and read status */}
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground min-w-[100px]">
        <span className="font-medium">{date}</span>
        {isRead ? (
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-primary" />
          </div>
        ) : onMarkAsRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead();
            }}
            className="w-6 h-6 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors"
            title="تعليم كمقروء"
          >
            <CheckCircle2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </button>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 text-right">
        <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-primary flex items-center justify-end gap-1 mt-1">
          <span className="font-medium">{sender}</span>
          <User className="w-4 h-4" />
        </p>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{preview}</p>
      </div>
      
      {/* Avatar */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
        {senderInitial}
      </div>
    </div>
  );
};

export default NotificationItem;
