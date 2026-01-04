import { useEffect } from "react";
import { Bell, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // 1. ضفنا useNavigate
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import universityLogo from "@/assets/hurghada-logo.png";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "sonner"; // 2. استيراد التوستر
import { useState } from "react";
import { fetchNotifications } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API_BASE_URL = "https://ghared-project-1lb7.onrender.com/api";
const SOCKET_URL = "https://ghared-project-1lb7.onrender.com";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 3. تعريف الهوك للتنقل
  const isLoginPage = location.pathname === "/login";
  const queryClient = useQueryClient();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // 1. كود جلب العدد (زي ما هو)
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return { data: { unreadCount: 0 } }; // حماية صغيرة

      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        params: { page: 1, limit: 5 },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      return response.data;
    },
    enabled: !isLoginPage && !!localStorage.getItem("token"),
    refetchInterval: 30000,
    retry: false,
  });

  // 2. كود السوكيت والتوستر
  useEffect(() => {
    if (isLoginPage) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket Connected!");
    });

    // ============================================
    // الجزء المعدل: إظهار التوستر عند وصول إشعار
    // ============================================
    socket.on("new_notification", (data) => {
      console.log("🔔 إشعار جديد وصل:", data);

      // 1. تحديث رقم الجرس الأحمر فوراً
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      // 2. تحديث صفحة الإشعارات لو مفتوحة
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      // 3. إظهار التوستر (زي فيسبوك)
      toast(data.subject || "إشعار جديد", {
        description: `من: ${data.senderName || "مستخدم"} - ${
          data.messageSnippet || ""
        }`,
        action: {
          label: "عرض",
          onClick: () => navigate("/notifications"), // لما يضغط عليه يروح للإشعارات
        },
        duration: 5000, // يختفي بعد 5 ثواني
        position: "top-center", // مكانه أعلى الشاشة (ممكن تغيريه لـ bottom-left)
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [isLoginPage, queryClient, navigate]); // ضفنا navigate هنا

  const unreadCount = notificationsData?.data?.unreadCount ?? 0;

  if (isLoginPage) {
    return (
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="text-primary border-primary"
          >
            تواصل معنا
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <h1 className="text-lg font-bold text-primary">جامعة الغردقة</h1>
              <p className="text-xs text-muted-foreground">
                HURGHADA UNIVERSITY
              </p>
            </div>
            <img
              src={universityLogo}
              alt="Logo"
              className="w-14 h-14 rounded-full shadow-md"
            />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={universityLogo}
            alt="Logo"
            className="w-10 h-10 rounded-full shadow-md"
          />
          <span className="text-xl font-bold text-primary hidden sm:block">
            غرد
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-foreground hover:text-primary">
            الرئيسية
          </Link>
          <Link to="/services" className="text-foreground hover:text-primary">
            خدماتنا
          </Link>
          <Link to="/contact" className="text-foreground hover:text-primary">
            اتصل بنا
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/notifications" className="relative group">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary/10 transition-all duration-300"
            >
              <Bell className="w-5 h-5 group-hover:animate-wiggle" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Link to="/profile">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10 bg-primary text-primary-foreground"
            >
              <span className="font-bold">F</span>
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowLogoutDialog(true)}
            className="hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد تسجيل الخروج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من أنك تريد تسجيل الخروج من حسابك؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              تسجيل الخروج
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default Header;
