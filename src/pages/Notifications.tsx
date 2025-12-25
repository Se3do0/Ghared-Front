import { RefreshCw, Check, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import NotificationItem from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useTransactions";
import { markNotificationRead } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Notifications = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, error, refetch, isRefetching } = useNotifications();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleRefresh = async () => {
    await refetch();
    toast.success("تم تحديث الإشعارات");
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationRead(notificationId);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("تم تعليم الإشعار كمقروء");
    } catch {
      toast.error("فشل في تعليم الإشعار");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const notifications = data?.notifications || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto page-container animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              className="gap-2 hover:border-primary hover:text-primary transition-all duration-300"
              disabled={isRefetching}
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <h1 className="text-2xl font-bold gradient-text">الإشعارات</h1>
          </div>

          {error ? (
            <div className="text-center py-16 text-destructive">
              حدث خطأ في تحميل الإشعارات
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <div
                  key={notification.notification_id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <NotificationItem
                    id={notification.notification_id.toString()}
                    title={notification.subject}
                    sender={notification.senderName}
                    senderInitial={notification.senderName?.[0] || "?"}
                    preview={notification.messageSnippet}
                    date={notification.date.split("T")[0]}
                    isRead={notification.is_read}
                    onMarkAsRead={() => handleMarkAsRead(notification.notification_id)}
                  />
                </div>
              ))}
            </div>
          )}

          {notifications.length === 0 && !error && (
            <div className="text-center py-16 text-muted-foreground animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Check className="w-10 h-10 text-primary" />
              </div>
              لا توجد إشعارات جديدة
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
