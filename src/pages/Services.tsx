import { motion } from "framer-motion";
import { FileText, Users, Eye, Archive, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Services = () => {
  const tutorialSteps = [
    {
      number: "١",
      title: "إنشاء معاملة",
      description: "ابدأ بإنشاء معاملة جديدة وأضف كافة التفاصيل المطلوبة بسهولة ويسر",
      icon: FileText,
      color: "from-primary to-primary/80",
    },
    {
      number: "٢",
      title: "اختيار المستلمين",
      description: "حدد المستلمين المطلوبين من قائمة الموظفين والإدارات المختلفة",
      icon: Users,
      color: "from-[hsl(var(--success))] to-[hsl(var(--success)/0.8)]",
    },
    {
      number: "٣",
      title: "المتابعة اللحظية",
      description: "تابع حالة المعاملة لحظة بلحظة واحصل على إشعارات فورية",
      icon: Eye,
      color: "from-[hsl(var(--info))] to-[hsl(var(--info)/0.8)]",
    },
    {
      number: "٤",
      title: "الأرشفة الذكية",
      description: "يتم حفظ جميع المعاملات تلقائياً في أرشيف منظم وسهل البحث",
      icon: Archive,
      color: "from-[hsl(var(--warning))] to-[hsl(var(--warning)/0.8)]",
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
        ease: "easeOut" as const,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              نظام غرد للمراسلات الإلكترونية
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              نظام متكامل لإدارة المعاملات والمراسلات الإلكترونية داخل جامعة الغردقة
              بطريقة حديثة وفعالة، مع إمكانية المتابعة اللحظية والأرشفة الذكية
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-16">
            <h2 className="section-title justify-center mb-10 text-2xl">
              كيف يعمل النظام؟
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tutorialSteps.map((step, index) => (
                <motion.div
                  key={step.number}
                  variants={cardVariants}
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                >
                  <Card className="relative h-full p-6 border-2 border-transparent hover:border-primary/30 transition-all duration-300 overflow-hidden group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                    <div className="relative z-10">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                        <step.icon className="w-8 h-8 text-white" />
                      </div>

                      <div className={`text-4xl font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent text-center mb-3`}>
                        {step.number}
                      </div>

                      <h3 className="text-xl font-bold text-center mb-3 text-foreground">
                        {step.title}
                      </h3>

                      <p className="text-sm text-muted-foreground text-center leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${step.color} rounded-full opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-300`} />
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/transactions/create">
                <Button
                  size="lg"
                  className="btn-glow text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-primary/30 bg-gradient-to-r from-primary to-primary/90"
                >
                  <span className="ml-2">ابدأ معاملة جديدة</span>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>

            <p className="mt-4 text-sm text-muted-foreground">
              ابدأ الآن في إرسال المعاملات والمراسلات بكل سهولة
            </p>
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="page-container"
        >
          <h2 className="section-title justify-end mb-6">مميزات النظام</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "سهولة الاستخدام",
                description: "واجهة بسيطة وسهلة الاستخدام لا تحتاج إلى تدريب معقد",
              },
              {
                title: "الأمان والخصوصية",
                description: "نظام محمي بأحدث معايير الأمان لحماية بياناتك",
              },
              {
                title: "الإشعارات الفورية",
                description: "احصل على إشعارات فورية عند تحديث حالة المعاملات",
              },
              {
                title: "البحث المتقدم",
                description: "ابحث عن أي معاملة بسهولة باستخدام عدة معايير",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-300"
              >
                <div className="w-2 h-auto bg-gradient-to-b from-primary to-primary/60 rounded-full" />
                <div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Services;
