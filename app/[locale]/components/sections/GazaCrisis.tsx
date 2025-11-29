"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { HeartIcon, HomeIcon, UsersIcon, DropletsIcon } from "lucide-react";
import Link from "next/link";

const GazaCrisis = ({ params }: { params: { locale: string } }) => {
  const { locale } = params;
  const isArabic = locale === "ar";

  const crisisData = [
    {
      icon: HomeIcon,
      title: isArabic ? "النازحون" : "Displaced Families",
      description: isArabic
        ? "أكثر من 1.9 مليون شخص نزحوا من ديارهم، يعيشون في ظروف إنسانية صعبة"
        : "Over 1.9 million people displaced from their homes, living in difficult humanitarian conditions",
      number: "1.9M+",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    {
      icon: DropletsIcon,
      title: isArabic ? "نقص المياه" : "Water Crisis",
      description: isArabic
        ? "وصول محدود للمياه النظيفة، مما يسبب مخاطر صحية خطيرة"
        : "Limited access to clean water, causing serious health risks",
      number: "95%",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: HeartIcon,
      title: isArabic ? "المساعدة الطبية" : "Medical Aid",
      description: isArabic
        ? "المرافق الصحية مدمرة والاحتياجات الطبية تفوق القدرات المتاحة"
        : "Health facilities destroyed and medical needs exceed available capacity",
      number: "50%",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: UsersIcon,
      title: isArabic ? "الأطفال المتضررون" : "Affected Children",
      description: isArabic
        ? "آلاف الأطفال يعانون من صدمات نفسية ونقص في الغذاء والتعليم"
        : "Thousands of children suffering from trauma, food shortages, and lack of education",
      number: "1M+",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl text-primary md:text-5xl font-bold  mb-4">
            {isArabic
              ? "أزمة غزة: الواقع الإنساني"
              : "Gaza Crisis: The Human Reality"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {isArabic
              ? "انضم إلينا في تقديم المساعدة العاجلة للأسر المتضررة في غزة. كل تبرع يحدث فرقاً حقيقياً في حياة الآخرين."
              : "Join us in providing urgent assistance to affected families in Gaza. Every donation makes a real difference in people's lives."}
          </p>
        </motion.div>

        {/* Crisis Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {crisisData.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`${item.bgColor} rounded-2xl p-6 text-center border border-border`}
              >
                <div
                  className={`w-16 h-16 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <div className={`text-3xl font-bold ${item.color} mb-2`}>
                  {item.number}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content with Image */}
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                {isArabic
                  ? "الوضع على أرض الواقع"
                  : "The Situation on the Ground"}
              </h3>
              <div className="space-y-5 text-muted-foreground text-base leading-relaxed">
                <p>
                  {isArabic
                    ? "الوضع الإنساني في غزة يصل إلى مستويات حرجة. الملايين يواجهون صراعات يومية للحصول على احتياجات أساسية مثل الطعام والماء والرعاية الطبية. البيوت والمدارس والمستشفيات دمرت، تاركة العائلات بلا مأوى."
                    : "The humanitarian situation in Gaza has reached critical levels. Millions face daily struggles for basic necessities like food, water, and medical care. Homes, schools, and hospitals have been destroyed, leaving families with nowhere to turn."}
                </p>
                <p>
                  {isArabic
                    ? "فرقنا تعمل بلا كلل لتوفير الإغاثة الطارئة، بما في ذلك طرود الطعام والماء النظيف والإمدادات الطبية والمأوى المؤقت. لكن الحاجة ساحقة، ولا يمكننا القيام بذلك بمفردنا."
                    : "Our teams are working tirelessly to provide emergency relief, including food packages, clean water, medical supplies, and temporary shelter. But the need is overwhelming, and we cannot do it alone."}
                </p>
                <p className="font-medium text-foreground">
                  {isArabic
                    ? "كل مساهمة تساعدنا في الوصول إلى المزيد من العائلات وتوفير المساعدة المنقذة للحياة. معاً، يمكننا جلب الأمل لمن هم في أمس الحاجة إليه."
                    : "Every contribution helps us reach more families and provide life-saving assistance. Together, we can bring hope to those who need it most."}
                </p>
              </div>
            </div>

            {/* Emergency Actions */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 p-8 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <HeartIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground">
                    {isArabic ? "الإجراءات العاجلة" : "Emergency Actions"}
                  </h4>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      icon: "🍲",
                      text: isArabic
                        ? "توزيع الطرود الغذائية والمياه النظيفة"
                        : "Distributing food packages and clean water",
                    },
                    {
                      icon: "🏥",
                      text: isArabic
                        ? "توفير الإمدادات الطبية والرعاية الصحية"
                        : "Providing medical supplies and healthcare",
                    },
                    {
                      icon: "🏠",
                      text: isArabic
                        ? "إعداد الملاجئ المؤقتة للعائلات النازحة"
                        : "Setting up temporary shelters for displaced families",
                    },
                    {
                      icon: "📚",
                      text: isArabic
                        ? "دعم المرافق التعليمية المؤقتة للأطفال"
                        : "Supporting temporary educational facilities for children",
                    },
                  ].map((action, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start gap-4 bg-background/50 rounded-xl p-4 backdrop-blur-sm hover:bg-background/70 transition-colors"
                    >
                      <div className="text-2xlshrink-0">{action.icon}</div>
                      <span className="text-foreground font-medium leading-relaxed">
                        {action.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative space-y-6"
          >
            {/* Main large image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              <div className="aspect-4/5 relative">
                <Image
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=1000&fit=crop"
                  alt={
                    isArabic
                      ? "المساعدة الإنسانية في غزة"
                      : "Humanitarian aid in Gaza"
                  }
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <p className="text-white text-lg font-semibold mb-2">
                      {isArabic
                        ? "فرقنا توصل المساعدة للأسر الأكثر احتياجاً"
                        : "Our teams reach the most vulnerable families"}
                    </p>
                    <p className="text-white/80 text-sm">
                      {isArabic
                        ? "العمل الميداني المستمر 24/7"
                        : "Continuous field work 24/7"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Call to Action  button*/}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-primary rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              {isArabic
                ? "ساعدنا في إحداث فرق الآن"
                : "Help Us Make a Difference Now"}
            </h3>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              {isArabic
                ? "مساعدتك اليوم يمكن أن تنقذ حياة وتوفر الأمل لعائلات بأكملها في غزة. كل تبرع، مهما كان صغيراً، يحدث فرقاً حقيقياً."
                : "Your help today can save lives and provide hope for entire families in Gaza. Every donation, no matter how small, makes a real difference."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/donate`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-primary-foreground text-primary-foreground font-semibold rounded-full hover:bg-primary-foreground/10 transition-colors"
              >
                {isArabic ? "تبرع الآن" : "Donate Now"}
                <HeartIcon className="w-5 h-5" />
              </Link>
              <Link
                href={`/${locale}/projects`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-primary-foreground text-primary-foreground font-semibold rounded-full hover:bg-primary-foreground/10 transition-colors"
              >
                {isArabic ? "اعرف المزيد" : "Learn More"}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GazaCrisis;
