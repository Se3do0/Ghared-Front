import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Reply, Loader2, FileText, Download, Eye, Check, X } from "lucide-react";
import Header from "@/components/layout/Header";
import TransactionsSidebar from "@/components/layout/TransactionsSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTransactionDetails, useTransactionAttachment } from "@/hooks/useTransactions";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { performTransactionAction } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const { openAttachment } = useTransactionAttachment();

const TransactionDetail = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, error, refetch } = useTransactionDetails(id || "");
  
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<"accept" | "reject" | null>(null);
  const [annotation, setAnnotation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleActionClick = (action: "accept" | "reject") => {
    setCurrentAction(action);
    setAnnotation("");
    setActionDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    if (!id || !currentAction) return;
    
    setIsSubmitting(true);
    try {
      const actionName = currentAction === "accept" ? "موافقة" : "رفض";
      await performTransactionAction(id, actionName, annotation);
      toast.success("تم تنفيذ الإجراء بنجاح");
      setActionDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16 text-destructive">
            حدث خطأ في تحميل تفاصيل المعاملة
          </div>
        </main>
      </div>
    );
  }

  const transaction = data.details;
  const attachments = data.attachments || [];
  const history = data.history || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <TransactionsSidebar />
          
          <div className="flex-1 page-container animate-fade-in">
            {/* Back button */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                رجوع للقائمة
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <h1 className="text-2xl font-bold">{transaction.subject}</h1>
            </div>

            {/* Transaction details card */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  تاريخ المعاملة: {new Date(transaction.date).toLocaleDateString("ar-EG")}
                </p>
                <Badge className="bg-primary text-primary-foreground">
                  {transaction.current_status}
                </Badge>
              </div>

              <div>
                <h2 className="text-xl font-bold text-right mb-4">تفاصيل المعاملة</h2>
                
                <div className="space-y-3 text-right">
                  <div className="flex justify-end gap-2">
                    <span className="text-muted-foreground">{transaction.code}</span>
                    <span className="font-medium">:رقم المعاملة</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <span className="text-muted-foreground">{transaction.sender_name}</span>
                    <span className="font-medium">:المرسل</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-bold text-right mb-2">موضوع المعاملة</h3>
                <p className="text-muted-foreground text-right">{transaction.subject}</p>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-bold text-right mb-2">نص الرسالة</h3>
                <div className="bg-muted/30 rounded-xl p-4 text-right">
                  <p className="text-foreground">{transaction.content}</p>
                </div>
              </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="border-t border-border pt-6">
                  <h3 className="font-bold text-right mb-4">المرفقات</h3>
                  <div className="space-y-3">
                    {attachments.map((attachment) => {
                      const fileName = attachment.description || attachment.file_path;
                      
                      return (
                        <div
                          key={attachment.attachment_id}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openAttachment(
                                  attachment.file_path,
                                  fileName,
                                  true // معاينة
                                )
                              }
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              معاينة
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openAttachment(
                                  attachment.file_path,
                                  fileName,
                                  false // تحميل
                                )
                              }
                              className="gap-2"
                            >
                              <Download className="w-4 h-4" />
                              تحميل
                            </Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-medium text-sm">{fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(attachment.attachment_date).toLocaleDateString("ar-EG")}
                              </p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* History */}
              {history.length > 0 && (
                <div className="border-t border-border pt-6">
                  <h3 className="font-bold text-right mb-4">سجل المعاملة</h3>
                  <div className="space-y-3">
                    {history.map((item, index) => (
                      <div
                        key={item.path_id || index}
                        className="flex items-center justify-end gap-4 p-3 bg-muted/20 rounded-lg text-sm"
                      >
                        <span className="text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString("ar-EG")}
                        </span>
                        <span>{item.path_notes}</span>
                        <span className="text-primary">{item.from_department} ← {item.to_department}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-6 flex gap-4 justify-start flex-wrap">
                <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                  <ArrowRight className="w-4 h-4" />
                  رجوع
                </Button>
                <Button variant="outline" className="gap-2 text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                  <Reply className="w-4 h-4" />
                  رد على المعاملة
                </Button>
                <Button
                  variant="default"
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => handleActionClick("accept")}
                >
                  <Check className="w-4 h-4" />
                  موافقة
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => handleActionClick("reject")}
                >
                  <X className="w-4 h-4" />
                  رفض
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              {currentAction === "accept" ? "تأكيد الموافقة" : "تأكيد الرفض"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="annotation" className="text-right block">
                الملاحظات
              </Label>
              <Textarea
                id="annotation"
                value={annotation}
                onChange={(e) => setAnnotation(e.target.value)}
                placeholder={
                  currentAction === "accept"
                    ? "مثال: تمت المراجعة وكل شيء سليم"
                    : "مثال: يوجد نقص في المرفقات"
                }
                className="text-right min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmitAction}
              disabled={isSubmitting || !annotation.trim()}
              className={currentAction === "accept" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={currentAction === "reject" ? "destructive" : "default"}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentAction === "accept" ? (
                "تأكيد الموافقة"
              ) : (
                "تأكيد الرفض"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionDetail;
