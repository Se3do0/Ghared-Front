import { Mail, Send, FileText, Trash2, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "outgoing", label: "الصادرة", icon: Mail, path: "/transactions/outgoing" },
  { id: "incoming", label: "الواردة", icon: Send, path: "/transactions/incoming" },
  { id: "drafts", label: "المعدة للإرسال", icon: FileText, path: "/transactions/drafts" },
  { id: "deleted", label: "المحذوفة", icon: Trash2, path: "/transactions/deleted" },
];

const TransactionsSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-card rounded-2xl border border-border p-4 h-fit sticky top-24">
      <h2 className="text-lg font-bold mb-4 text-right">المعاملات</h2>
      
      <nav className="space-y-2 mb-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.id === "outgoing" && location.pathname.startsWith("/transactions") && !menuItems.slice(1).some(m => location.pathname === m.path));
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "sidebar-item w-full justify-end",
                isActive && "sidebar-item-active"
              )}
            >
              <span>{item.label}</span>
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </nav>

      <Link to="/transactions/create">
        <Button className="w-full gap-2 justify-center" size="lg">
          <Plus className="w-5 h-5" />
          معاملة جديدة
        </Button>
      </Link>
    </aside>
  );
};

export default TransactionsSidebar;
