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
import { fetchNotifications, fetchUserProfile, BASE_URL, UserProfileData } from "@/lib/api";
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
  const { logout } = useAuth();
  const isLoginPage = location.pathname === "/login";
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => fetchNotifications(1, 1),
    enabled: !isLoginPage,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const unreadCount = notificationsData?.unreadCount ?? 0;

  if (isLoginPage) {
    return (
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="text-primary border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
          >
            تواصل معنا
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <h1 className="text-lg font-bold text-primary">جامعة الغردقة</h1>
              <p className="text-xs text-muted-foreground">HURGHADA UNIVERSITY</p>
            </div>
            <img
              src={universityLogo}
              alt="Logo"
              className="w-14 h-14 rounded-full shadow-md hover:scale-110 transition-transform duration-300 hover:shadow-lg"
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
          <span className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors hidden sm:block">
            غرد
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { path: "/contact", label: "اتصل بنا" },
            { path: "/services", label: "خدماتنا" },
            { path: "/", label: "الرئيسية" },
          ].map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`relative py-2 transition-all duration-300 hover:text-primary group ${
                location.pathname === item.path 
                  ? "text-primary font-medium" 
                  : "text-foreground"
              }`}
            >
              {item.label}
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 origin-right ${
                location.pathname === item.path 
                  ? "scale-x-100" 
                  : "scale-x-0 group-hover:scale-x-100 group-hover:origin-left"
              }`} />
            </Link>
          ))}
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
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Link to="/profile" className="group">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full w-10 h-10 transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                location.pathname === "/profile"
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                  : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground"
              }`}
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
