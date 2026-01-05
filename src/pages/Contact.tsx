import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactFormSchema = z.object({
  name: z.string().min(3, { message: "الاسم يجب أن يكون 3 أحرف على الأقل" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صحيح" }),
  subject: z.string().min(5, { message: "الموضوع يجب أن يكون 5 أحرف على الأقل" }),
  message: z.string().min(10, { message: "الرسالة يجب أن تكون 10 أحرف على الأقل" }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Form submitted:", data);

      toast.success("تم إرسال رسالتك بنجاح!", {
        description: "سنقوم بالرد عليك في أقرب وقت ممكن",
      });

      form.reset();
    } catch (error) {
      toast.error("حدث خطأ أثناء إرسال الرسالة", {
        description: "يرجى المحاولة مرة أخرى",
      });
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "البريد الإلكتروني",
      value: "info@hurghada.edu.eg",
      color: "from-primary to-primary/80",
    },
    {
      icon: Phone,
      title: "رقم الهاتف",
      value: "+20 123 456 7890",
      color: "from-[hsl(var(--success))] to-[hsl(var(--success)/0.8)]",
    },
    {
      icon: MapPin,
      title: "العنوان",
      value: "جامعة الغردقة، الغردقة، مصر",
      color: "from-[hsl(var(--info))] to-[hsl(var(--info)/0.8)]",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              تواصل معنا
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نحن هنا للإجابة على استفساراتك ومساعدتك في استخدام نظام غرد
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <motion.div variants={itemVariants}>
              <Card className="p-8 h-full">
                <h2 className="text-2xl font-bold mb-6 text-right">معلومات الاتصال</h2>

                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={info.title}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <info.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right flex-1">
                        <h3 className="font-bold text-sm text-muted-foreground mb-1">
                          {info.title}
                        </h3>
                        <p className="text-foreground font-medium">{info.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="mt-8 p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                >
                  <h3 className="font-bold text-lg mb-2 text-right">ساعات العمل</h3>
                  <p className="text-muted-foreground text-sm text-right">
                    الأحد - الخميس: 9:00 صباحاً - 5:00 مساءً
                  </p>
                  <p className="text-muted-foreground text-sm text-right mt-1">
                    الجمعة - السبت: مغلق
                  </p>
                </motion.div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-8 h-full">
                <h2 className="text-2xl font-bold mb-6 text-right">أرسل لنا رسالة</h2>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">الاسم</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="أدخل اسمك الكامل"
                              {...field}
                              className="input-focus"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="email@example.com"
                              {...field}
                              className="input-focus"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">موضوع الرسالة</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ما هو موضوع رسالتك؟"
                              {...field}
                              className="input-focus"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">نص الرسالة</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="اكتب رسالتك هنا..."
                              rows={5}
                              {...field}
                              className="input-focus resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full btn-glow bg-gradient-to-r from-primary to-primary/90 hover:shadow-xl hover:shadow-primary/30"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          <span>جاري الإرسال...</span>
                        ) : (
                          <>
                            <span className="ml-2">إرسال الرسالة</span>
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Contact;
