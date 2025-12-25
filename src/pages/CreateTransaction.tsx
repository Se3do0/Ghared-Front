import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Save, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useFormData } from "@/hooks/useTransactions";
import { createTransaction } from "@/lib/api";

interface Attachment {
  id: string;
  file: File;
  description: string;
  date: string;
}

const CreateTransaction = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: formData, isLoading: formLoading } = useFormData();
  
  const [activeTab, setActiveTab] = useState("main");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [transactionNature, setTransactionNature] = useState("new");
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentDescription, setAttachmentDescription] = useState("");
  const [selectedReceivers, setSelectedReceivers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const toggleReceiver = (userId: number) => {
    setSelectedReceivers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSaveDraft = async () => {
    // For now just navigate, draft API can be added later
    toast.success("تم حفظ المعاملة كمسودة");
    navigate("/transactions/drafts");
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
      // send is_draft as false
      formDataToSend.append("is_draft", "false");

      // Add receivers as comma-separated string (API expects single value)
      formDataToSend.append("receivers", selectedReceivers.join(","));

      // Add attachments (each as 'attachments' field - API expects this format)
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

  const receivers = formData?.receivers || [];
  const types = formData?.types || [];

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
                      {selectedFile ? selectedFile.name.slice(0, 15) + "..." : "Choose File"}
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {receivers.map((receiver) => (
                  <div
                    key={receiver.user_id}
                    className={`border rounded-xl p-4 text-right cursor-pointer transition-all duration-200 ${
                      selectedReceivers.includes(receiver.user_id) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleReceiver(receiver.user_id)}
                  >
                    <div className="flex items-start justify-end gap-3">
                      <div>
                        <p className="font-medium">{receiver.full_name}</p>
                        <p className="text-sm text-primary">{receiver.department_name}</p>
                      </div>
                      <Checkbox
                        checked={selectedReceivers.includes(receiver.user_id)}
                        onCheckedChange={() => toggleReceiver(receiver.user_id)}
                      />
                    </div>
                  </div>
                ))}
              </div>

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
