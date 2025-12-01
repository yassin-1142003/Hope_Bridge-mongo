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
    <section data-aos="fade-up" className="py-32 relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-primary/5"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div> */}

      <div className=" w-[90%] mx-auto text-center relative ">
        {/* Icon and visual elements */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-8 shadow-2xl">
          <Mail className="w-10 h-10 text-white" />
        </div>

        {/* Enhanced heading section */}
        <div className="flex flex-col gap-4 md:gap-6 mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <span className="text-primary font-bold text-base uppercase tracking-widest">
              {isArabic ? "النشرة الإخبارية" : "Newsletter"}
            </span>
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-wide text-accent-foreground mb-6 leading-tight">
            {isArabic
              ? "ابقَ على اطلاع بتأثيرنا"
              : "Stay Updated with Our Impact"}
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-medium max-w-4xl mx-auto leading-relaxed">
            {isArabic
              ? "اشترك لتصلك أحدث الأخبار عن مشاريعنا وتأثيرنا في المجتمع"
              : "Subscribe to receive the latest news about our projects and community impact"}
          </p>
        </div>

        {/* Enhanced form */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-none p-8 md:p-10 shadow-2xl">
          <form className="flex flex-col sm:flex-row items-stretch gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Mail
                className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground ${
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
                className={`h-14 ${
                  isArabic ? "pr-12 pl-4" : "pl-12 pr-4"
                } text-lg border-2 border-primary/20 
                  focus:border-primary rounded-none bg-background/80 backdrop-blur-sm
                  shadow-sm hover:shadow-md transition-all duration-300
                  focus:ring-4 focus:ring-primary/20`}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-14 rounded-none px-8 md:px-10 bg-primary hover:bg-primary/90 
                text-background font-bold text-lg
                shadow-xl hover:shadow-2xl transform hover:scale-105
                transition-all duration-300 group
                border-2 border-primary hover:border-primary/80"
            >
              <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
              {isArabic ? "اشترك الآن" : "Subscribe"}
            </Button>
          </form>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-8 text-base text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">
                {isArabic ? "مجاني تماماً" : "100% Free"}
              </span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium">
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
