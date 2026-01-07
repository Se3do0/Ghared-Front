import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Send, Save, Plus, Trash2, Upload, Loader2, FileText, Calendar, Search, X, Filter } from "lucide-react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useFormData, useSent, useDrafts } from "@/hooks/useTransactions";
import { createTransaction, saveDraft } from "@/lib/api";

interface Attachment {
  id: string;
  file: File;
  description: string;
  date: string;
}

const CreateTransaction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { data: formData, isLoading: formLoading } = useFormData();
  const { data: historyTransactions, isLoading: historyLoading } = useSent();
  const { data: draftsData, refetch: refetchDrafts } = useDrafts();

  const [activeTab, setActiveTab] = useState("main");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [transactionNature, setTransactionNature] = useState("new");
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentDescription, setAttachmentDescription] = useState("");
  const [selectedReceivers, setSelectedReceivers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentTransactionId, setParentTransactionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const receivers = formData?.receivers || [];
  const types = formData?.types || [];

  // --- استخراج الأقسام بشكل ديناميكي من الـ API ---
  const departments = useMemo(() => {
    const deptsMap = new Map();
    receivers.forEach((deptGroup) => {
      deptGroup.employees.forEach((emp) => {
        if (!deptsMap.has(emp.department_id)) {
          deptsMap.set(emp.department_id, emp.department_name);
        }
      });
    });
    return Array.from(deptsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [receivers]);

  // --- منطق الفلترة المشترك (بحث + قسم) ---
  const filteredEmployees = useMemo(() => {
    return receivers.flatMap(dept => dept.employees).filter((emp) => {
      const matchesSearch =
        emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.user_id.toString().includes(searchQuery);

      const matchesDept =
        departmentFilter === "all" || emp.department_id.toString() === departmentFilter;

      return matchesSearch && matchesDept;
    });
  }, [receivers, searchQuery, departmentFilter]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAddAttachment = () => {
    if (!selectedFile) {
      toast.error("يرجى اختيار ملف");
      return;
    }
    if (!attachmentDescription.trim()) {
      toast.error("يرجى إدخال وصف الملف");
      return;
    }

    const newAttachment: Attachment = {
      id: Date.now().toString(),
      file: selectedFile,
      description: attachmentDescription,
      date: new Date().toLocaleDateString('ar-EG'),
    };

    setAttachments([...attachments, newAttachment]);
    setAttachmentDescription("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("تم إضافة المرفق بنجاح");
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
    toast.success("تم حذف المرفق");
  };

  useEffect(() => {
    const draftId = searchParams.get("draftId");
    if (draftId && draftsData) {
      const draft = draftsData.find((d: any) => d.transaction_id === Number(draftId));
      if (draft) {
        setSubject(draft.subject || "");
        setContent(draft.content || "");
        toast.success("تم تحميل المسودة بنجاح");
      }
    }
  }, [searchParams, draftsData]);

  useEffect(() => {
    if (transactionNature === "new") {
      setParentTransactionId(null);
    }
  }, [transactionNature]);

  const toggleReceiver = (userId: number) => {
    setSelectedReceivers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSaveDraft = async () => {
    if (!subject.trim()) {
      toast.error("يرجى إدخال موضوع المعاملة");
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("subject", subject);
      formDataToSend.append("content", content);
      formDataToSend.append("type_id", selectedTypeId?.toString() || "1");
      formDataToSend.append("is_draft", "true");

      if (parentTransactionId) {
        formDataToSend.append("parent_transaction_id", parentTransactionId.toString());
      }

      if (selectedReceivers.length > 0) {
        formDataToSend.append("receivers", selectedReceivers.join(","));
      }

      attachments.forEach((attachment) => {
        formDataToSend.append("attachments", attachment.file);
      });

      const result = await saveDraft(formDataToSend);
      toast.success(result.message || "تم حفظ المعاملة كمسودة بنجاح");
      await refetchDrafts();
      navigate("/transactions/drafts");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل في حفظ المسودة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedReceivers.length === 0) {
      toast.error("يرجى اختيار جهة واحدة على الأقل");
      return;
    }
    if (!subject.trim()) {
      toast.error("يرجى إدخال موضوع المعاملة");
      return;
    }
    if (!selectedTypeId) {
      toast.error("يرجى اختيار نوع المعاملة");
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("subject", subject);
      formDataToSend.append("content", content);
      formDataToSend.append("type_id", selectedTypeId.toString());
      formDataToSend.append("is_draft", "false");

      if (parentTransactionId) {
        formDataToSend.append("parent_transaction_id", parentTransactionId.toString());
      }

      formDataToSend.append("receivers", selectedReceivers.join(","));

      attachments.forEach((attachment) => {
        formDataToSend.append("attachments", attachment.file);
      });

      const result = await createTransaction(formDataToSend);
      toast.success(result.message || "تم إرسال المعاملة بنجاح");
      navigate("/transactions/outgoing");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل في إرسال المعاملة");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || formLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto page-container animate-fade-in">
          <h1 className="text-2xl font-bold text-right mb-6">إنشاء معاملة</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="main">الرئيسية</TabsTrigger>
              <TabsTrigger value="attachments">إدراج المرفقات</TabsTrigger>
              <TabsTrigger value="send">الإرسال</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-6">
              <div className="space-y-2">
                <Label className="text-right block">الموضوع</Label>
                <Input
                  placeholder="ادخل موضوع المعاملة"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-right block">مضمون الخطاب</Label>
                <Textarea
                  placeholder="ادخل محتوى الخطاب"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] text-right"
                  dir="rtl"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-right block">طبيعة المعاملة</Label>
                <RadioGroup value={transactionNature} onValueChange={setTransactionNature} className="flex gap-8 justify-end">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="reply">رد أو إستدراك لمعاملة سابقة</Label>
                    <RadioGroupItem value="reply" id="reply" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="new">معاملة جديدة</Label>
                    <RadioGroupItem value="new" id="new" />
                  </div>
                </RadioGroup>
              </div>

              {transactionNature === "reply" && (
                <div className="space-y-4 border border-border rounded-xl p-4 bg-muted/30">
                  <Label className="text-right block font-medium">الرجاء اختيار المعاملة المراد استدراكها</Label>

                  {historyLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="mr-2 text-muted-foreground">جاري التحميل...</span>
                    </div>
                  ) : historyTransactions && historyTransactions.length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {historyTransactions.map((transaction) => (
                        <label
                          key={transaction.transaction_id}
                          htmlFor={`reply-${transaction.transaction_id}`}
                          className={`block border rounded-lg p-4 cursor-pointer transition-all duration-200 ${parentTransactionId === transaction.transaction_id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/50 bg-background'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="badge bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full border border-border">
                              {transaction.code}
                            </span>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                  <span className="font-medium">{transaction.subject}</span>
                                  <FileText className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex items-center gap-2 justify-end text-sm text-muted-foreground mt-1">
                                  <span>{transaction.date?.split("T")[0]}</span>
                                  <Calendar className="w-3 h-3" />
                                </div>
                              </div>
                              <input
                                type="radio"
                                name="parent-transaction"
                                id={`reply-${transaction.transaction_id}`}
                                value={transaction.transaction_id}
                                checked={parentTransactionId === transaction.transaction_id}
                                onChange={() => setParentTransactionId(transaction.transaction_id)}
                                className="w-4 h-4 text-primary"
                              />
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد معاملات سابقة
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <Label className="text-right block">نوع المعاملة</Label>
                <RadioGroup
                  value={selectedTypeId?.toString() || ""}
                  onValueChange={(val) => setSelectedTypeId(Number(val))}
                  className="flex gap-8 justify-end flex-wrap"
                >
                  {types.map((type) => (
                    <div key={type.id} className="flex items-center gap-2">
                      <Label htmlFor={`type-${type.id}`}>{type.name}</Label>
                      <RadioGroupItem value={type.id.toString()} id={`type-${type.id}`} />
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-start pt-4">
                <Button onClick={() => setActiveTab("attachments")}>
                  التالي: إدراج المرفقات
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-6">
              <div className="border border-border rounded-xl p-6">
                <h3 className="font-bold text-right mb-4">المرفقات</h3>

                <div className="flex gap-4 items-end mb-6">
                  <Button onClick={handleAddAttachment} className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة
                  </Button>
                  <div className="flex-1">
                    <Label className="text-right block mb-2">وصف الملف</Label>
                    <Input
                      placeholder="مثال: صورة البطاقة الشخصية"
                      value={attachmentDescription}
                      onChange={(e) => setAttachmentDescription(e.target.value)}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="w-48">
                    <Label className="text-right block mb-2">اختر الملف</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      {selectedFile ? selectedFile.name.slice(0, 15) + "..." : "إرفاق ملف"}
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">حذف الملف</TableHead>
                      <TableHead className="text-right">اسم الملف</TableHead>
                      <TableHead className="text-right">وصف الملف</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الرقم</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attachments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          لا توجد مرفقات حتى الآن
                        </TableCell>
                      </TableRow>
                    ) : (
                      attachments.map((attachment, index) => (
                        <TableRow key={attachment.id}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveAttachment(attachment.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">{attachment.file.name}</TableCell>
                          <TableCell className="text-right">{attachment.description}</TableCell>
                          <TableCell className="text-right">{attachment.date}</TableCell>
                          <TableCell className="text-right">{index + 1}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between pt-4">
                <Button onClick={() => setActiveTab("send")}>
                  التالي: الإرسال
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("main")}>
                  السابق
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="send" className="space-y-6">
              <h3 className="font-bold text-right text-lg">تحديد الجهات المرسل إليها</h3>

              <div className="space-y-4 border border-border rounded-xl p-4 bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* شريط البحث */}
                  <div className="relative">
                    <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث برقم أو اسم الموظف..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-4 pr-10 text-right"
                      dir="rtl"
                    />
                  </div>

                  {/* فلتر الأقسام الديناميكي */}
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="text-right bg-background">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        <SelectValue placeholder="اختر الإدارة" />
                      </div>
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="all">كل الإدارات</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedReceivers.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReceivers([])}
                      className="gap-2 text-primary hover:bg-primary/20"
                    >
                      <X className="w-4 h-4" />
                      مسح التحديد
                    </Button>
                    <span className="text-sm font-medium">
                      تم تحديد {selectedReceivers.length} موظف
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredEmployees.map((receiver) => (
                  <div
                    key={receiver.user_id}
                    className={`border rounded-xl p-4 text-right cursor-pointer transition-all duration-200 ${selectedReceivers.includes(receiver.user_id)
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                      }`}
                    onClick={() => toggleReceiver(receiver.user_id)}
                  >
                    <div className="flex items-start justify-end gap-3">
                      <div>
                        <p className="font-medium">{receiver.full_name}</p>
                        <p className="text-sm text-primary">{receiver.department_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          #{receiver.user_id}
                        </p>
                      </div>
                      <Checkbox
                        checked={selectedReceivers.includes(receiver.user_id)}
                        onCheckedChange={() => toggleReceiver(receiver.user_id)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  لم يتم العثور على موظفين يطابقون البحث
                </div>
              )}

              <div className="flex gap-4 justify-start pt-8">
                <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  إرسال المعاملة
                </Button>
                <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
                  <Save className="w-4 h-4" />
                  حفظ كمسودة
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CreateTransaction;