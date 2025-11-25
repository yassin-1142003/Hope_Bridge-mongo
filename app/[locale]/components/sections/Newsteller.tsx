import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Send, Sparkles } from "lucide-react";

const Newsteller = async ({
  params: { locale },
}: {
  params: { locale: string };
}) => {
  const isArabic = locale === "ar";

  return (
    <section data-aos="fade-up" className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div> */}

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Icon and visual elements */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6 shadow-lg">
          <Mail className="w-8 h-8 text-white" />
        </div>

        {/* Enhanced heading section */}
        <div className="flex flex-col gap-3 md:gap-4 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">
              {isArabic ? "النشرة الإخبارية" : "Newsletter"}
            </span>
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-wide text-accent-foreground mb-3">
            {isArabic
              ? "ابقَ على اطلاع بتأثيرنا"
              : "Stay Updated with Our Impact"}
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            {isArabic
              ? "اشترك لتصلك أحدث الأخبار عن مشاريعنا وتأثيرنا في المجتمع"
              : "Subscribe to receive the latest news about our projects and community impact"}
          </p>
        </div>

        {/* Enhanced form */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-none p-6 md:p-8 shadow-xl">
          <form className="flex flex-col sm:flex-row items-stretch gap-4 max-w-lg mx-auto">
            <div className="flex-1 relative">
              <Mail
                className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${
                  isArabic ? "right-3" : "left-3"
                }`}
              />
              <Input
                type="email"
                dir={isArabic ? "rtl" : "ltr"}
                placeholder={
                  isArabic
                    ? "أدخل بريدك الإلكتروني"
                    : "Enter your email address"
                }
                className={`h-12 ${
                  isArabic ? "pr-10 pl-4" : "pl-10 pr-4"
                } text-base border-2 border-primary/20 
                  focus:border-primary rounded-none bg-background/80 backdrop-blur-sm
                  shadow-sm hover:shadow-md transition-all duration-300
                  focus:ring-4 focus:ring-primary/20`}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-12 rounded-none px-6 md:px-8 bg-primary hover:bg-primary/90 
                text-background font-bold text-base
                shadow-lg hover:shadow-xl transform hover:scale-105
                transition-all duration-300 group
                border-2 border-primary hover:border-primary/80"
            >
              <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
              {isArabic ? "اشترك الآن" : "Subscribe"}
            </Button>
          </form>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{isArabic ? "مجاني تماماً" : "100% Free"}</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>
                {isArabic ? "إلغاء الاشتراك في أي وقت" : "Unsubscribe anytime"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsteller;
