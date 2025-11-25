import { getTranslations } from "next-intl/server";
import { highlightWord } from "../../../../components/highlightWord";

const Overview = async ({
  params: { locale },
}: {
  params: { locale: string };
}) => {
  const isArabic = locale === "ar";
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const thierhope = t("hopetitle");
  const highlightyouarethierhope = isArabic ? "أملهم" : "Hope";

  return (
    <section
      className={`relative flex py-12 md:py-24 px-4 md:px-8 items-center justify-center gap-8 md:gap-16 ${
        isArabic ? "md:flex-row-reverse" : "md:flex-row"
      } flex-col overflow-hidden`}
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Content Section */}
      <div
        data-aos={isArabic ? "fade-left" : "fade-right"}
        data-aos-duration="800"
        className={`relative z-10 flex flex-col gap-4 md:gap-6 max-w-2xl text-center ${
          isArabic ? "md:text-right" : "md:text-left"
        }`}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-accent-foreground leading-tight">
          {highlightWord(
            thierhope,
            highlightyouarethierhope,
            "text-primary drop-shadow-sm"
          )}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-accent-foreground/80 font-medium leading-relaxed">
          {t("hopesubtitle")}
        </p>
      </div>

      {/* Image Pills Section */}
      <div
        data-aos={isArabic ? "fade-right" : "fade-left"}
        data-aos-duration="800"
        className="relative flex justify-center items-center"
      >
        {/* Decorative glow behind pills */}
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 opacity-50" />

        <div className="relative -rotate-[20deg]  transition-transform duration-700 ease-out">
          <div className="flex gap-3 md:gap-5 items-center justify-center p-4">
            {/* Left pill */}
            <div
              className="group relative w-20 h-40 md:w-32 md:h-64 rounded-full overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
              style={{
                backgroundImage: "url('/homepage/06.webp')",
                backgroundPosition: "0% center",
                backgroundSize: "300% auto",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Middle pill - taller */}
            <div
              className="group relative w-20 h-60 md:w-32 md:h-96 rounded-full overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105"
              style={{
                backgroundImage: "url('/homepage/06.webp')",
                backgroundPosition: "50% center",
                backgroundSize: "300% auto",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Highlight border on center pill */}
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
            </div>

            {/* Right pill */}
            <div
              className="group relative w-20 h-40 md:w-32 md:h-64 rounded-full overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
              style={{
                backgroundImage: "url('/homepage/06.webp')",
                backgroundPosition: "100% center",
                backgroundSize: "300% auto",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>

        {/* Floating accent elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/10 rounded-full blur-xl animate-pulse delay-700" />
      </div>
    </section>
  );
};

export default Overview;
