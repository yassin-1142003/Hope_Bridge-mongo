"use client";

import { motion } from "framer-motion";
import { UsersIcon, ClockIcon, HeartIcon, AwardIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const VolunteerSection = ({ params }: { params: { locale: string } }) => {
  const { locale } = params;
  const isArabic = locale === "ar";

  const opportunities = [
    {
      icon: HeartIcon,
      title: isArabic ? "المساعدة المباشرة" : "Direct Assistance",
      description: isArabic 
        ? "ساعد في توزيع المساعدات الغذائية والإمدادات الطبية" 
        : "Help distribute food assistance and medical supplies",
      time: isArabic ? "مرن" : "Flexible",
      level: isArabic ? "مبتدئ" : "Beginner",
    },
    {
      icon: UsersIcon,
      title: isArabic ? "دعم المجتمع" : "Community Support",
      description: isArabic 
        ? "شارك في تنظيم الفعاليات المجتمعية والأنشطة التعليمية" 
        : "Participate in community events and educational activities",
      time: isArabic ? "عطلة نهاية الأسبوع" : "Weekends",
      level: isArabic ? "جميع المستويات" : "All Levels",
    },
    {
      icon: AwardIcon,
      title: isArabic ? "المهارات المتخصصة" : "Skilled Volunteering",
      description: isArabic 
        ? "قدم مهاراتك الطبية أو التعليمية أو التقنية" 
        : "Offer your medical, educational, or technical skills",
      time: isArabic ? "حسب الحاجة" : "As Needed",
      level: isArabic ? "متقدم" : "Advanced",
    },
    {
      icon: ClockIcon,
      title: isArabic ? "الدعم الإداري" : "Administrative Support",
      description: isArabic 
        ? "ساعد في تنظيم العمليات وتنسيق الفرق" 
        : "Help organize operations and coordinate teams",
      time: isArabic ? "ساعات عمل" : "Business Hours",
      level: isArabic ? "مبتدئ" : "Beginner",
    },
  ];

  const testimonials = [
    {
      name: isArabic ? "سارة أحمد" : "Sarah Ahmed",
      role: isArabic ? "متطوعة منذ 3 سنوات" : "Volunteer for 3 years",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=faces",
      testimonial: isArabic 
        ? "التطوع مع جسر الأمل غير حياتي. الشعور بمساعدة الآخرين لا يقدر بثمن." 
        : "Volunteering with Hope Bridge changed my life. The feeling of helping others is priceless.",
    },
    {
      name: isArabic ? "محمد علي" : "Mohammed Ali",
      role: isArabic ? "متطوع منذ سنتين" : "Volunteer for 2 years",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      testimonial: isArabic 
        ? "الفرق هنا مثل العائلة. نعمل معاً لتحقيق أهداف عظيمة." 
        : "The team here is like family. We work together to achieve great things.",
    },
    {
      name: isArabic ? "فاطمة حسن" : "Fatima Hassan",
      role: isArabic ? "متطوعة منذ 6 أشهر" : "Volunteer for 6 months",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces",
      testimonial: isArabic 
        ? "كل يوم أتعلم شيئاً جديداً وأساهم في إحداث فرق حقيقي." 
        : "Every day I learn something new and contribute to making a real difference.",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            {isArabic ? "انضم إلى فريقنا التطوعي" : "Join Our Volunteer Team"}
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto">
            {isArabic 
              ? "وقتك ومهاراتك يمكن أن تحدث فرقاً حقيقياً في حياة الآخرين. انضم إلينا اليوم وكن جزءاً من التغيير." 
              : "Your time and skills can make a real difference in people's lives. Join us today and be part of the change."}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Opportunities */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-foreground mb-8">
              {isArabic ? "فرص التطوع" : "Volunteer Opportunities"}
            </h3>
            <div className="space-y-6">
              {opportunities.map((opportunity, index) => {
                const Icon = opportunity.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-foreground mb-2">
                          {opportunity.title}
                        </h4>
                        <p className="text-muted-foreground mb-4">
                          {opportunity.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{opportunity.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AwardIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{opportunity.level}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Image and Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Hero Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1559027618-c8e82789c944?w=600&h=600&fit=crop&crop=entropy"
                alt={isArabic ? "المتطوعون في العمل" : "Volunteers in action"}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <h4 className="text-2xl font-bold text-white mb-2">
                  {isArabic ? "كن بطلاً في مجتمعك" : "Be a Hero in Your Community"}
                </h4>
                <p className="text-white/90">
                  {isArabic ? "انضم إلى أكثر من 500 متطوع يحدثون فرقاً" : "Join over 500 volunteers making a difference"}
                </p>
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-primary rounded-3xl p-8 text-primary-foreground text-center">
              <h4 className="text-2xl font-bold mb-4">
                {isArabic ? "هل أنت مستعد للبدء؟" : "Ready to Get Started?"}
              </h4>
              <p className="mb-6 opacity-90">
                {isArabic 
                  ? "سجل اليوم وانضم إلى فريقنا التطوعي المذهل" 
                  : "Sign up today and join our amazing volunteer team"}
              </p>
              <Link
                href={`/${locale}/volunteer`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary-foreground text-primary font-bold rounded-full hover:bg-primary-foreground/90 transition-colors shadow-lg"
              >
                {isArabic ? "سجل كمتطوع" : "Register as Volunteer"}
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-foreground text-center mb-12">
            {isArabic ? "ماذا يقول متطوعونا" : "What Our Volunteers Say"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-1">
                  {testimonial.name}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {testimonial.role}
                </p>
                <p className="text-muted-foreground italic">
                  "{testimonial.testimonial}"
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VolunteerSection;
