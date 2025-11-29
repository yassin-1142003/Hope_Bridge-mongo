"use client";

import { motion } from "framer-motion";
import { HeartIcon, StarIcon, PlayIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const ImpactStories = ({ params }: { params: { locale: string } }) => {
  const { locale } = params;
  const isArabic = locale === "ar";

  const stories = [
    {
      id: 1,
      title: isArabic ? "نور بعد الظلام" : "Light After Darkness",
      subtitle: isArabic
        ? "طفلة تحصل على رعاية تعليمية وصحية بعد فقدان أسرتها"
        : "A young girl receives full care and education after losing her family",
      image:
        "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&h=400&fit=crop&crop=entropy",
      category: isArabic ? "رعاية الأيتام" : "Orphan Care",
      impact: isArabic
        ? "رعاية كاملة لـ 320 طفلاً سنوياً"
        : "Full care provided for 320 children yearly",
      date: isArabic ? "مارس 2025" : "March 2025",
      featured: true,
    },
    {
      id: 2,
      title: isArabic ? "عيادة الأمل المتنقلة" : "The Hope Mobile Clinic",
      subtitle: isArabic
        ? "علاج مجاني للأسر الفقيرة في المناطق النائية"
        : "Free medical treatment for underserved families",
      image:
        "https://images.unsplash.com/photo-1601288496920-b6154fe362dd?w=600&h=400&fit=crop&crop=entropy",
      category: isArabic ? "صحة" : "Health",
      impact: isArabic
        ? "عالجنا أكثر من 4,200 مريض هذا العام"
        : "Over 4,200 patients treated this year",
      date: isArabic ? "فبراير 2025" : "February 2025",
      featured: false,
    },
    {
      id: 3,
      title: isArabic ? "بئر لكل قرية" : "A Well for Every Village",
      subtitle: isArabic
        ? "توفير مياه نظيفة لـ 10,000 شخص"
        : "Providing clean water to 10,000 people",
      image:
        "https://images.unsplash.com/photo-1603457883120-4ec7f2a0a75a?w=600&h=400&fit=crop&crop=entropy",
      category: isArabic ? "مياه" : "Water",
      impact: isArabic
        ? "18 بئراً تم حفرها خلال العام الماضي"
        : "18 wells drilled last year",
      date: isArabic ? "يناير 2025" : "January 2025",
      featured: false,
    },
    {
      id: 4,
      title: isArabic ? "مشروع رزق للأرامل" : "Livelihood for Widows",
      subtitle: isArabic
        ? "توفير مشاريع صغيرة تضمن دخلاً شهرياً ثابتاً"
        : "Small projects providing stable monthly income",
      image:
        "https://images.unsplash.com/photo-1524231757912-21f9e983a2d9?w=600&h=400&fit=crop&crop=entropy",
      category: isArabic ? "تمكين المرأة" : "Women Empowerment",
      impact: isArabic
        ? "ساعدنا 150 أرملة في بدء مشروعهن الخاص"
        : "150 widows supported in starting small businesses",
      date: isArabic ? "ديسمبر 2024" : "December 2024",
      featured: false,
    },
    {
      id: 5,
      title: isArabic ? "وجبة كريمة" : "A Dignified Meal",
      subtitle: isArabic
        ? "توزيع الوجبات على الأسر المحتاجة يومياً"
        : "Delivering meals to needy families daily",
      image:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop&crop=entropy",
      category: isArabic ? "غذاء" : "Food",
      impact: isArabic
        ? "أكثر من 20,000 وجبة وزعت هذا الشهر"
        : "Over 20,000 meals distributed this month",
      date: isArabic ? "نوفمبر 2024" : "November 2024",
      featured: false,
    },
    {
      id: 6,
      title: isArabic ? "مركز مهارات الشباب" : "Youth Skills Center",
      subtitle: isArabic
        ? "تأهيل الشباب لسوق العمل من خلال التدريب المهني"
        : "Preparing youth for employment through vocational training",
      image:
        "https://images.unsplash.com/photo-1519455953755-af066f52f1ea?w=600&h=400&fit=crop&crop=entropy",
      category: isArabic ? "تنمية" : "Development",
      impact: isArabic
        ? "تخريج 230 شاباً جاهزين للعمل"
        : "230 young graduates ready for work",
      date: isArabic ? "أكتوبر 2024" : "October 2024",
      featured: false,
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-primary mb-6">
            {isArabic ? "قصص تأثير حقيقية" : "Real Impact Stories"}
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto">
            {isArabic
              ? "كل قصة تمثل أملاً جديداً وحياة تغيرت بفضل دعمكم. شاهد كيف نحدث فرقاً معاً."
              : "Every story represents new hope and a life changed thanks to your support. See how we're making a difference together."}
          </p>
        </motion.div>

        {/* Featured Story */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="relative rounded-3xl overflow-hidden bg-card border border-border shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-video lg:aspect-square">
                <Image
                  src={stories[0].image}
                  alt={stories[0].title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-full">
                    {isArabic ? "قصة مميزة" : "Featured Story"}
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 text-white/90 mb-2">
                    <StarIcon className="w-4 h-4" />
                    <span className="text-sm">{stories[0].date}</span>
                    <span>•</span>
                    <span className="text-sm">{stories[0].category}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {stories[0].title}
                  </h3>
                  <p className="text-white/90 mb-4">{stories[0].subtitle}</p>
                  <div className="flex items-center gap-2 text-white">
                    <HeartIcon className="w-5 h-5" />
                    <span className="font-medium">{stories[0].impact}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="mb-8">
                  <span className="px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-full">
                    {isArabic ? "قصة هذا الشهر" : "Story of the Month"}
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  {stories[0].title}
                </h3>
                <p className="text-lg text-muted-foreground mb-8">
                  {isArabic
                    ? "فقد كريم والديه وهو في سن السابعة، لكن حلمه بأن يصبح طبيباً لم يمت. بفضل برنامج الرعاية التعليمية، تلقى كريم منحة دراسية كاملة لدراسة الطب. اليوم، بعد 10 سنوات، تخرج كريم بتفوق وعاد إلى قريته ليفتح عيادة مجانية. إنه الآن يعالج مئات المرضى شهرياً ويلهم جيلاً جديداً من الشباب."
                    : "Kareem lost his parents at age seven, but his dream of becoming a doctor never died. Through our educational sponsorship program, Kareem received a full scholarship to study medicine. Today, 10 years later, Kareem graduated with honors and returned to his village to open a free clinic. He now treats hundreds of patients monthly and inspires a new generation of youth."}
                </p>
                <div className="flex items-center gap-4 text-muted-foreground mb-8">
                  <div className="flex items-center gap-2">
                    <HeartIcon className="w-4 h-4" />
                    <span>{stories[0].impact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-4 h-4" />
                    <span>{stories[0].date}</span>
                  </div>
                </div>
                <Link
                  href={`/${locale}/stories/${stories[0].id}`}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors"
                >
                  {isArabic ? "اقرأ القصة الكاملة" : "Read Full Story"}
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* More Stories Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            {isArabic ? "المزيد من قصص الأمل" : "More Stories of Hope"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.slice(1).map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                      {story.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <StarIcon className="w-4 h-4" />
                    <span>{story.date}</span>
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {story.title}
                  </h4>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {story.subtitle}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HeartIcon className="w-4 h-4" />
                      <span>{story.impact}</span>
                    </div>
                    <Link
                      href={`/${locale}/stories/${story.id}`}
                      className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      {isArabic ? "اقرأ" : "Read"}
                      <ArrowRightIcon className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="bg-primary/10 rounded-3xl p-8 md:p-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              {isArabic
                ? "كن جزءاً من القصة التالية"
                : "Be Part of the Next Story"}
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isArabic
                ? "مساعدتك اليوم يمكن أن تصبح قصة نجاح الغد. انضم إلينا وكن بطلاً في قصة شخص ما."
                : "Your help today can become tomorrow's success story. Join us and be a hero in someone's story."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/donate`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors shadow-lg"
              >
                {isArabic ? "ادعم قصة جديدة" : "Support a New Story"}
                <HeartIcon className="w-5 h-5" />
              </Link>
              <Link
                href={`/${locale}/stories`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-primary text-primary font-bold rounded-full hover:bg-primary/10 transition-colors"
              >
                {isArabic ? "شاهد جميع القصص" : "View All Stories"}
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ImpactStories;
