import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, X, Edit } from "lucide-react";
import Header from "@/components/layout/Header";
import TransactionsSidebar from "@/components/layout/TransactionsSidebar";
import TransactionList from "@/components/transactions/TransactionList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useInbox, useSent, useDrafts, useDeleted } from "@/hooks/useTransactions";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { fetchTransactionDetails } from "@/lib/api";

const typeLabels: Record<string, string> = {
  outgoing: "الصادرات",
  incoming: "الواردات",
  drafts: "المعدة للإرسال",
  deleted: "المحذوفة",
};

const Transactions = () => {
  const { type = "incoming" } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data based on type
  const inboxQuery = useInbox();
  const sentQuery = useSent();
  const draftsQuery = useDrafts();
  const deletedQuery = useDeleted();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Get the right query based on type
  const getQueryForType = () => {
    switch (type) {
      case "incoming":
        return inboxQuery;
      case "outgoing":
        return sentQuery;
      case "drafts":
        return draftsQuery;
      case "deleted":
        return deletedQuery;
      default:
        return inboxQuery;
    }
  };

  const query = getQueryForType();
  const { data, isLoading, error } = query;

  const [receiverMap, setReceiverMap] = useState<Record<string, string[]>>({});

  const transactions = data?.map((t) => ({
    id: t.transaction_id.toString(),
    sender: t.sender_name || "",
    subject: t.subject || "",
    subjectPreview: t.code || "",
    date: new Date(t.date).toLocaleDateString("ar-EG"),
    receivers: receiverMap[t.transaction_id] || [],
  })) || [];

  const filteredTransactions = transactions.filter(
    (t) =>
      (t.sender?.includes(searchQuery) ?? false) ||
      (t.subject?.includes(searchQuery) ?? false)
  );

  // When viewing outgoing, fetch details for each transaction to extract receiver departments
  useEffect(() => {
    let mounted = true;
    const loadDetails = async () => {
      if (type !== "outgoing" || !data || data.length === 0) return;

      const newMap: Record<string, string[]> = { ...receiverMap };

      await Promise.all(
        data.map(async (t) => {
          const idStr = t.transaction_id.toString();
          if (newMap[idStr]) return;
          try {
            const details = await fetchTransactionDetails(idStr);
            const tracking = details?.tracking || [];
            const toDeps = tracking
              .filter((t: any) => t.type === "movement")
              .map((t: any) => t.department)
              .filter(Boolean) as string[];
            // dedupe
            newMap[idStr] = Array.from(new Set(toDeps));
          } catch (e) {
            // ignore individual failures
          }
        })
      );

      if (mounted) setReceiverMap(newMap);
    };

    loadDetails();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, data]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <TransactionsSidebar />
          
          <div className="flex-1 page-container animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="relative w-64">
                <Input
                  placeholder="بحث"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 pl-10"
                  dir="rtl"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <h1 className="text-2xl font-bold">{typeLabels[type] || "الواردات"}</h1>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="py-12 text-center text-destructive">
                حدث خطأ في تحميل البيانات
              </div>
            ) : type === "drafts" ? (
              <div className="divide-y divide-border">
                {filteredTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-4 px-2 hover:bg-muted/50 transition-colors rounded-lg group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/transactions/create?draftId=${transaction.id}`)}
                      className="gap-2 text-primary hover:bg-primary/10"
                    >
                      <Edit className="w-4 h-4" />
                      تحرير
                    </Button>

                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-muted-foreground text-sm">{transaction.subject}</span>
                        <span className="font-medium text-foreground">{transaction.sender}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{transaction.subjectPreview}</p>
                      <p className="text-xs text-muted-foreground mt-1">{transaction.date}</p>
                    </div>
                  </div>
                ))}

                {filteredTransactions.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    لا توجد مسودات
                  </div>
                )}
              </div>
            ) : (
              <TransactionList
                transactions={filteredTransactions}
                basePath={`/transactions/${type}`}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Transactions;
