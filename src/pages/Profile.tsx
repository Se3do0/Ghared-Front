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
    mobile_number: "",
    landline: "",
    faxNumber: "",
    password: "",
    confirmPassword: "",
    email: "",
    mobileNumber: "",
    landline: "",
    fax: "",
  });

  const getProfileImageUrl = (profilePicture: string | null | undefined) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith("http") || profilePicture.startsWith("data:")) return profilePicture;
    return `${BASE_URL}/uploads/Images/${profilePicture}`;
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserProfile();
      setProfile(data);
      setFormData((prev) => ({
        ...prev,
        mobile_number: data.mobile_number || "",
        landline: (data as any).landline || "",
        faxNumber: (data as any).fax_number || (data as any).faxNumber || "",
      }));
      if (data.profile_picture) {
        setPreviewUrl(getProfileImageUrl(data.profile_picture));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ في جلب البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset to original values
      setFormData({
        mobile_number: profile?.mobile_number || "",
        landline: (profile as any)?.landline || "",
        faxNumber: (profile as any)?.fax_number || (profile as any)?.faxNumber || "",
        password: "",
        confirmPassword: "",
      });
      setSelectedFile(null);
      setPreviewUrl(getProfileImageUrl(profile?.profile_picture));
    }
    setIsEditMode(!isEditMode);
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

      // Server-required fields (even if read-only in UI)
      formDataToSend.append("fullName", profile?.full_name || "");
      formDataToSend.append("email", profile?.email || "");

      // Editable fields
      formDataToSend.append("mobileNumber", formData.mobile_number);
      formDataToSend.append("landline", formData.landline.trim() || "");
      if (formData.faxNumber.trim()) {
        formDataToSend.append("faxNumber", formData.faxNumber.trim());
      }

      const trimmedPassword = formData.password.trim();
      if (trimmedPassword && trimmedPassword.length >= 6) {
        formDataToSend.append("password", trimmedPassword);
      }
      if (selectedFile) {
        formDataToSend.append("profilePicture", selectedFile);
      }

      await updateUserProfile(formDataToSend);
      toast.success("تم تحديث البيانات بنجاح");

      // Refresh profile data
      await loadProfile();

      // Reset password fields and exit edit mode
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      setSelectedFile(null);
      setIsEditMode(false);
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
        <div className="max-w-3xl mx-auto">
          <Card className="border-border/50 shadow-xl overflow-hidden animate-fade-in">
            {/* Profile Header */}
            <CardHeader className="bg-gradient-to-r from-[#0891b2] to-[#155e75] text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-4 border-white/30 shadow-lg">
                      <AvatarImage src={previewUrl || undefined} alt={profile?.full_name} />
                      <AvatarFallback className="bg-[#0e7490] text-white text-xl font-bold">
                        {getInitials(profile?.full_name || "")}
                      </AvatarFallback>
                    </Avatar>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-[#0e7490]" />
                      </button>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold mb-1">
                      {profile?.full_name || "المستخدم"}
                    </CardTitle>
                    <p className="text-cyan-100 text-sm">{profile?.email}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={isEditMode ? "secondary" : "outline"}
                  onClick={handleEditToggle}
                  className={`gap-2 transition-all duration-300 bg-[#164e63] hover:bg-[#083344] text-white border border-cyan-400/30`}
                >
                  {isEditMode ? (
                    <>
                      <X className="w-4 h-4" />
                      إلغاء
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" />
                      تعديل
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name - Always Read-Only */}
                    <div className="space-y-2">
                      <Label className="text-right block font-medium text-muted-foreground">
                        الاسم الكامل
                      </Label>
                      <div className="relative">
                        <Input
                          value={profile?.full_name || ""}
                          disabled
                          readOnly
                          className="pr-10 text-right bg-muted/50 cursor-not-allowed opacity-75"
                          dir="rtl"
                        />
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                      </div>
                    </div>

                    {/* Email - Always Read-Only */}
                    <div className="space-y-2">
                      <Label className="text-right block font-medium text-muted-foreground">
                        البريد الإلكتروني
                      </Label>
                      <div className="relative">
                        <Input
                          type="email"
                          value={profile?.email || ""}
                          disabled
                          readOnly
                          className="pr-10 text-right bg-muted/50 cursor-not-allowed opacity-75"
                          dir="rtl"
                        />
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editable Section */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-4">
                    البيانات القابلة للتعديل
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mobile Number - Editable */}
                    <div className="space-y-2">
                      <Label className="text-right block font-medium">رقم الموبايل</Label>
                      <div className="relative group">
                        <Input
                          placeholder="ادخل رقم الموبايل"
                          value={formData.mobile_number}
                          onChange={(e) => handleChange("mobile_number", e.target.value)}
                          disabled={!isEditMode}
                          className={`pr-10 text-right transition-all duration-300 ${isEditMode
                            ? "border-teal-500/50 focus:border-teal-500 focus:ring-teal-500/20"
                            : "bg-muted/30"
                            }`}
                          dir="rtl"
                        />
                        <Phone
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isEditMode ? "text-teal-500" : "text-muted-foreground/50"
                            }`}
                        />
                      </div>
                    </div>

                    {/* Landline - Editable */}
                    <div className="space-y-2">
                      <Label className="text-right block font-medium">الهاتف الأرضي</Label>
                      <div className="relative group">
                        <Input
                          placeholder="ادخل الهاتف الأرضي"
                          value={formData.landline}
                          onChange={(e) => handleChange("landline", e.target.value)}
                          disabled={!isEditMode}
                          className={`pr-10 text-right transition-all duration-300 ${isEditMode
                            ? "border-teal-500/50 focus:border-teal-500 focus:ring-teal-500/20"
                            : "bg-muted/30"
                            }`}
                          dir="rtl"
                        />
                      </div>
                    </div>

                    {/* Fax Number - Editable */}
                    <div className="space-y-2">
                      <Label className="text-right block font-medium">الفاكس</Label>
                      <div className="relative group">
                        <Input
                          placeholder="ادخل رقم الفاكس"
                          value={formData.faxNumber}
                          onChange={(e) => handleChange("faxNumber", e.target.value)}
                          disabled={!isEditMode}
                          className={`pr-10 text-right transition-all duration-300 ${isEditMode
                            ? "border-teal-500/50 focus:border-teal-500 focus:ring-teal-500/20"
                            : "bg-muted/30"
                            }`}
                          dir="rtl"
                        />
                      </div>
                    </div>

                    {/* Profile Picture Upload - Editable */}
                    <div className="space-y-2">
                      <Label className="text-right block font-medium">الصورة الشخصية</Label>
                      <div className="relative group">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => isEditMode && fileInputRef.current?.click()}
                          disabled={!isEditMode}
                          className={`w-full justify-between text-right transition-all duration-300 ${isEditMode
                            ? "border-teal-500/50 hover:border-teal-500 hover:bg-teal-500/5"
                            : "bg-muted/30 cursor-not-allowed"
                            }`}
                        >
                          <span className={isEditMode ? "text-foreground" : "text-muted-foreground"}>
                            {selectedFile ? selectedFile.name : "اختر صورة"}
                          </span>
                          <Upload
                            className={`w-5 h-5 transition-colors ${isEditMode ? "text-teal-500" : "text-muted-foreground/50"
                              }`}
                          />
                        </Button>
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
