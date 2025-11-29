"use client";

import { motion } from "framer-motion";
import { HandshakeIcon, GlobeIcon, HeartIcon, AwardIcon } from "lucide-react";
import Image from "next/image";

const PartnersSection = ({ params }: { params: { locale: string } }) => {
  const { locale } = params;
  const isArabic = locale === "ar";

  const partners = [
    {
      name: isArabic ? "الصحة العالمية" : "World Health Organization",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=100&fit=crop&crop=entropy",
      type: isArabic ? "شريك صحي" : "Health Partner",
      description: isArabic
        ? "التعاون في المبادرات الصحية والطبية"
        : "Collaborating on health and medical initiatives",
    },
    {
      name: isArabic ? "يونيسف" : "UNICEF",
      logo: "https://images.unsplash.com/photo-1618477247221-acd2f19e6d19?w=200&h=100&fit=crop&crop=entropy",
      type: isArabic ? "شريك تعليمي" : "Education Partner",
      description: isArabic
        ? "دعم برامج التعليم وحماية الأطفال"
        : "Supporting education and child protection programs",
    },
    {
      name: isArabic ? "برنامج الأغذية العالمي" : "World Food Programme",
      logo: "https://images.unsplash.com/photo-1605000797499-95a51c5269f9?w=200&h=100&fit=crop&crop=entropy",
      type: isArabic ? "شريك غذائي" : "Food Security Partner",
      description: isArabic
        ? "توفير المساعدات الغذائية الطارئة"
        : "Providing emergency food assistance",
    },
    {
      name: isArabic ? "الهلال الأحمر" : "Red Crescent",
      logo: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=200&h=100&fit=crop&crop=entropy",
      type: isArabic ? "شريك إغاثي" : "Relief Partner",
      description: isArabic
        ? "الاستجابة السريعة للأزمات والكوارث"
        : "Rapid response to crises and disasters",
    },
    {
      name: isArabic ? "يونسكو" : "UNESCO",
      logo: "https://images.unsplash.com/photo-1568605114967-8130f333a4b8?w=200&h=100&fit=crop&crop=entropy",
      type: isArabic ? "شريك ثقافي" : "Cultural Partner",
      description: isArabic
        ? "الحفاظ على التراث الثقافي والتعليم"
        : "Preserving cultural heritage and education",
    },
    {
      name: isArabic ? "البنك الدولي" : "World Bank",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop&crop=entropy",
      type: isArabic ? "شريك تنموي" : "Development Partner",
      description: isArabic
        ? "تمويل المشاريع التنموية المستدامة"
        : "Financing sustainable development projects",
    },
    {
      name: isArabic ? "منظمة الأمم المتحدة" : "United Nations",
      logo: "https://images.unsplash.com/photo-1526472838492-7a9c453c4b3c?w=200&h=100&fit=crop&crop=entropy",
      type: isArabic ? "شريك عالمي" : "Global Partner",
      description: isArabic
        ? "التعاون في المبادرات العالمية"
        : "Collaborating on global initiatives",
    },
    {
      name: isArabic ? "التحالف الإنساني" : "Humanitarian Coalition",
      logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=100&fit=crop&crop=entropy",
      type: isArabic ? "شريك استراتيجي" : "Strategic Partner",
      description: isArabic
        ? "تنسيق الجهود الإنسانية المشتركة"
        : "Coordinating joint humanitarian efforts",
    },
  ];

  const achievements = [
    {
      icon: AwardIcon,
      title: isArabic ? "اعتماد دولي" : "International Accreditation",
      description: isArabic
        ? "حاصل على اعتماد من المنظمات الدولية المعتمدة"
        : "Certified by international organizations",
    },

    {
      icon: HeartIcon,
      title: isArabic ? "ثقة المانحين" : "Donor Trust",
      description: isArabic
        ? "تقييم 4.9/5 من قبل المانحين والشركاء"
        : "Rated 4.9/5 by donors and partners",
    },
    {
      icon: HandshakeIcon,
      title: isArabic ? "شراكات قوية" : "Strong Partnerships",
      description: isArabic
        ? "أكثر من 50 شريكاً استراتيجياً"
        : "Over 50 strategic partnerships",
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
          <h2 className="text-4xl md:text-6xl font-bold text-[#2c2c2b] dark:text-background mb-6">
            {isArabic ? "شركاؤنا في التغيير" : "Our Partners in Change"}
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto">
            {isArabic
              ? "نحن فخورون بالعمل مع منظمات عالمية ومحلية رائدة لتحقيق أهدافنا المشتركة في إحداث تأثير إيجابي."
              : "We are proud to work with leading global and local organizations to achieve our shared goals of making a positive impact."}
          </p>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-20"
        >
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {achievement.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Partners Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {isArabic ? "شركاؤنا الموثوقون" : "Our Trusted Partners"}
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isArabic
                ? "نحن نعمل معاً مع هذه المنظمات المرموقة لتحقيق أهدافنا المشتركة"
                : "We work together with these prestigious organizations to achieve our shared goals"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Logo */}
                <div className="relative w-full h-24 mb-4 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                      <GlobeIcon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h4 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {partner.name}
                </h4>
                <p className="text-sm text-primary font-medium mb-2">
                  {partner.type}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {partner.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">
                {isArabic ? "ISO 9001 معتمد" : "ISO 9001 Certified"}
              </span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium">
                {isArabic ? "مراجعة سنوية" : "Annual Audited"}
              </span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="font-medium">
                {isArabic ? "شفافية 100%" : "100% Transparent"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection;
