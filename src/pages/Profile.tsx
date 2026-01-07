import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, Image, Save, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateProfile } from "@/lib/api";

const Profile = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
    confirmPassword: "",
    email: "",
    mobileNumber: "",
    landline: "",
    fax: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("كلمة المرور غير متطابقة");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      if (formData.fullName) formDataToSend.append('fullName', formData.fullName);
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.password) formDataToSend.append('password', formData.password);
      if (formData.mobileNumber) formDataToSend.append('mobileNumber', formData.mobileNumber);

      await updateProfile(formDataToSend);
      toast.success("تم تحديث البيانات الشخصية بنجاح");
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="profile-header relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 animate-shimmer" 
                style={{ backgroundSize: '200% 100%' }} 
              />
              <h1 className="relative z-10">البيانات الشخصية</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <Label className="text-right block font-medium">الاسم الكامل</Label>
                  <div className="relative group">
                    <Input
                      placeholder="ادخل الاسم الكامل"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className="pr-10 text-right input-focus border-primary/30 focus:border-primary"
                      dir="rtl"
                    />
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                  <Label className="text-right block font-medium">كلمة المرور</Label>
                  <Input
                    type="password"
                    placeholder="ادخل كلمة المرور"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="text-right input-focus"
                    dir="rtl"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <Label className="text-right block font-medium">تأكيد كلمة المرور</Label>
                  <Input
                    type="password"
                    placeholder="ادخل كلمة المرور"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="text-right input-focus"
                    dir="rtl"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.25s' }}>
                  <Label className="text-right block font-medium">البريد الإلكتروني</Label>
                  <div className="relative group">
                    <Input
                      type="email"
                      placeholder="ادخل البريد الإلكتروني"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="pr-10 text-right input-focus"
                      dir="rtl"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <Label className="text-right block font-medium">رقم الموبايل</Label>
                  <div className="relative group">
                    <Input
                      placeholder="ادخل رقم الموبايل"
                      value={formData.mobileNumber}
                      onChange={(e) => handleChange('mobileNumber', e.target.value)}
                      className="pr-10 text-right input-focus"
                      dir="rtl"
                    />
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                {/* Landline */}
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.35s' }}>
                  <Label className="text-right block font-medium">
                    الرقم الأرضي <span className="text-muted-foreground text-sm">(إختياري)</span>
                  </Label>
                  <Input
                    placeholder="ادخل الرقم الأرضي"
                    value={formData.landline}
                    onChange={(e) => handleChange('landline', e.target.value)}
                    className="text-right input-focus"
                    dir="rtl"
                  />
                </div>

                {/* Fax */}
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <Label className="text-right block font-medium">
                    رقم الفاكس <span className="text-muted-foreground text-sm">(إختياري)</span>
                  </Label>
                  <Input
                    placeholder="ادخل رقم الفاكس"
                    value={formData.fax}
                    onChange={(e) => handleChange('fax', e.target.value)}
                    className="text-right input-focus"
                    dir="rtl"
                  />
                </div>

                {/* Profile Picture */}
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.45s' }}>
                  <Label className="text-right block font-medium">
                    الصورة الشخصية <span className="text-muted-foreground text-sm">(إختياري)</span>
                  </Label>
                  <div className="relative">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full justify-between text-right hover:border-primary hover:bg-primary/5 transition-all duration-300"
                    >
                      <span className="text-muted-foreground">Choose File</span>
                      <Image className="w-5 h-5 text-primary/60" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-10 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting}
                  className="px-12 gap-2 btn-glow bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isSubmitting ? "جاري التحديث..." : "تحديث البيانات الشخصية"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
