import { useState, useEffect, useRef } from "react";
import { User, Phone, Mail, Lock, Camera, Edit3, Save, Loader2, X, Upload } from "lucide-react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchUserProfile, updateUserProfile, UserProfileData, BASE_URL } from "@/lib/api";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    mobile_number: "",
    password: "",
    confirmPassword: "",
  });

  const getProfileImageUrl = (profilePicture: string | null | undefined) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith("http") || profilePicture.startsWith("data:")) return profilePicture;
    return `${BASE_URL}/${profilePicture}`;
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

    // Validate passwords match
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("كلمة المرور غير متطابقة");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Only send editable fields: mobile_number, profile_picture, password
      formDataToSend.append("mobile_number", formData.mobile_number);
      
      if (formData.password) {
        formDataToSend.append("password", formData.password);
      }
      if (selectedFile) {
        formDataToSend.append("profile_picture", selectedFile);
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
      toast.error(error instanceof Error ? error.message : "حدث خطأ في تحديث البيانات");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Card className="border-border/50 shadow-xl">
              <CardHeader className="bg-gradient-to-l from-teal-600 to-teal-700 text-white rounded-t-lg">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-20 h-20 rounded-full bg-white/20" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48 bg-white/20" />
                    <Skeleton className="h-4 w-32 bg-white/20" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-cairo" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border-border/50 shadow-xl overflow-hidden animate-fade-in">
            {/* Profile Header */}
            <CardHeader className="bg-gradient-to-l from-teal-600 to-teal-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-4 border-white/30 shadow-lg">
                      <AvatarImage src={previewUrl || undefined} alt={profile?.full_name} />
                      <AvatarFallback className="bg-teal-800 text-white text-xl font-bold">
                        {getInitials(profile?.full_name || "")}
                      </AvatarFallback>
                    </Avatar>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-teal-600" />
                      </button>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold mb-1">
                      {profile?.full_name || "المستخدم"}
                    </CardTitle>
                    <p className="text-teal-100 text-sm">{profile?.email}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={isEditMode ? "secondary" : "outline"}
                  onClick={handleEditToggle}
                  className={`gap-2 transition-all duration-300 ${isEditMode
                    ? "bg-white/20 hover:bg-white/30 text-white border-white/30"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/30"
                    }`}
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

            {/* Form Content */}
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Read-Only Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-4">
                    البيانات الأساسية
                  </h3>

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

                    {/* New Password - Editable */}
                    <div className="space-y-2">
                      <Label className="text-right block font-medium">كلمة المرور الجديدة</Label>
                      <div className="relative group">
                        <Input
                          type="password"
                          placeholder="ادخل كلمة المرور الجديدة"
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                          disabled={!isEditMode}
                          className={`pr-10 text-right transition-all duration-300 ${isEditMode
                            ? "border-teal-500/50 focus:border-teal-500 focus:ring-teal-500/20"
                            : "bg-muted/30"
                            }`}
                          dir="rtl"
                        />
                        <Lock
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isEditMode ? "text-teal-500" : "text-muted-foreground/50"
                            }`}
                        />
                      </div>
                    </div>

                    {/* Confirm Password - Editable */}
                    <div className="space-y-2">
                      <Label className="text-right block font-medium">تأكيد كلمة المرور</Label>
                      <div className="relative group">
                        <Input
                          type="password"
                          placeholder="أعد إدخال كلمة المرور"
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange("confirmPassword", e.target.value)}
                          disabled={!isEditMode}
                          className={`pr-10 text-right transition-all duration-300 ${isEditMode
                            ? "border-teal-500/50 focus:border-teal-500 focus:ring-teal-500/20"
                            : "bg-muted/30"
                            }`}
                          dir="rtl"
                        />
                        <Lock
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isEditMode ? "text-teal-500" : "text-muted-foreground/50"
                            }`}
                        />
                      </div>
                      {formData.password &&
                        formData.confirmPassword &&
                        formData.password !== formData.confirmPassword && (
                          <p className="text-destructive text-sm mt-1">كلمة المرور غير متطابقة</p>
                        )}
                    </div>
                  </div>
                </div>

                {/* Submit Button - Only visible in edit mode */}
                {isEditMode && (
                  <div className="flex justify-center pt-6 animate-fade-in">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={
                        isSubmitting ||
                        (formData.password !== formData.confirmPassword && formData.password !== "")
                      }
                      className="px-12 gap-2 bg-gradient-to-l from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          جاري التحديث...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          حفظ التغييرات
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
