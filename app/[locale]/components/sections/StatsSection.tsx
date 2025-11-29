import { Baby, BriefcaseMedical, CookingPot, HandHeart } from "lucide-react";
import { getTranslations } from "next-intl/server";

const StatsSection = async ({
  params: { locale },
}: {
  params: { locale: string };
}) => {
  const isArabic = locale === "ar";
  const statics = await getTranslations({ locale, namespace: "statics" });

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20" />
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-primary mb-8">
            {isArabic ? "أثرنا بالأرقام" : "Our Impact in Numbers"}
          </h2>
          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {isArabic
              ? "كل رقم يحكي قصة أمل وتغيير إيجابي في حياة الآخرين. شاهد كيف نحقق فرقاً حقيقياً في مجتمعنا."
              : "Every number tells a story of hope and positive change in people's lives. See how we're making a real difference in our community."}
          </p>
        </div>

        {/* Stats Grid */}
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {[
            {
              icon: HandHeart,
              label: statics("project"),
              value: "90+",
              description: isArabic ? "مشاريع مكتملة" : "Completed Projects",
              color: "bg-gradient-to-r from-emerald-500 to-green-600",
              bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
            },
            {
              icon: CookingPot,
              label: statics("food"),
              value: "20K+",
              description: isArabic ? "وجبة مقدمة" : "Meals Served",
              color: "bg-gradient-to-r from-orange-500 to-amber-600",
              bgColor: "bg-orange-50 dark:bg-orange-950/20",
            },
            {
              icon: BriefcaseMedical,
              label: statics("medical"),
              value: "300+",
              description: isArabic
                ? "حالات طبية مساعدة"
                : "Medical Cases Assisted",
              color: "bg-gradient-to-r from-blue-500 to-cyan-600",
              bgColor: "bg-blue-50 dark:bg-blue-950/20",
            },
            {
              icon: Baby,
              label: statics("orphans"),
              value: "1.1K+",
              description: isArabic ? "يتيم رعايتهم" : "Orphans Supported",
              color: "bg-gradient-to-r from-pink-500 to-rose-600",
              bgColor: "bg-pink-50 dark:bg-pink-950/20",
            },
          ].map(
            ({ icon: Icon, label, value, description, color, bgColor }, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105"
              >
                {/* Subtle gradient overlay */}
                <div
                  className={`absolute inset-0 ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Content */}
                <div className="relative p-6 md:p-8">
                  {/* Icon with enhanced background */}
                  <div className="mb-4">
                    <div
                      className={`inline-flex p-3 rounded-2xl ${bgColor} shadow-md group-hover:shadow-lg transition-all duration-300`}
                    >
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
                      >
                        <Icon
                          strokeWidth={1.5}
                          className="text-white"
                          size={28}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Value with enhanced styling */}
                  <div className="mb-2">
                    <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent leading-none">
                      {value}
                    </h3>
                  </div>

                  {/* Label */}
                  <h4 className="text-lg font-bold text-foreground mb-2 leading-tight">
                    {label}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>

                  {/* Decorative elements */}
                  <div
                    className={`absolute -top-2 -right-2 w-16 h-16 rounded-full ${color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                  />
                  <div
                    className={`absolute -bottom-1 -left-1 w-12 h-12 rounded-full ${color} opacity-5 group-hover:opacity-15 transition-opacity duration-500`}
                  />
                </div>
              </div>
            )
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <p className="text-xl text-muted-foreground mb-8">
            {isArabic
              ? "انضم إلينا وكن جزءاً من هذا التأثير الإيجابي"
              : "Join us and be part of this positive impact"}
          </p>
          {/* <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`/${locale}/donate`}
              className="inline-flex items-center justify-center px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {isArabic ? "تبرع الآن" : "Donate Now"}
            </a>
            <a
              href={`/${locale}/volunteer`}
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary hover:bg-primary/5 text-primary font-bold rounded-lg transition-all duration-300 hover:scale-105"
            >
              {isArabic ? "تطوع معنا" : "Volunteer With Us"}
            </a>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
