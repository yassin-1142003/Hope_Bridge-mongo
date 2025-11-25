import NewsSection from "../../../../components/NewsSection";

const News = async ({ params: { locale } }: { params: { locale: string } }) => {
  return (
    <section
      data-aos="fade-up"
      className="flex flex-col justify-center items-center overflow-hidden "
    >
      <div className="flex flex-col flex-wrap justify-center gap-3 md:gap-5 items-center text-center px-2">
        <NewsSection locale={locale} />
      </div>
    </section>
  );
};

export default News;
