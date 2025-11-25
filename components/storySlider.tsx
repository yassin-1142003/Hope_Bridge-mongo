"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import GradientText from "./GradientText";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "./ui/button";

const ProjectSlider = () => {
  const t = useTranslations("Stories");
  const locale = useLocale();
  const isArabic = locale === "ar";

  const stories = [
    {
      id: 1,
      title: t("singlestory.name"),
      img: "/img3.jpg",
      desc: t("singlestory.desc"),
    },
    {
      id: 2,
      title: t("singlestory.name"),
      img: "/img3.jpg",
      desc: t("singlestory.desc"),
    },
    {
      id: 3,
      title: t("singlestory.name"),
      img: "/img3.jpg",
      desc: t("singlestory.desc"),
    },
    {
      id: 4,
      title: t("singlestory.name"),
      img: "/img3.jpg",
      desc: t("singlestory.desc"),
    },
    {
      id: 5,
      title: t("singlestory.name"),
      img: "/img3.jpg",
      desc: t("singlestory.desc"),
    },
    {
      id: 6,
      title: t("singlestory.name"),
      img: "/img3.jpg",
      desc: t("singlestory.desc"),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        loop={true}
        centeredSlides={true}
        slidesPerView="auto"
        spaceBetween={20}
        breakpoints={{
          0: { spaceBetween: 10 },
          640: { spaceBetween: 15 },
          1024: { spaceBetween: 20 },
        }}
      >
        {stories.map((proj) => (
          <SwiperSlide
            key={proj.id}
            className="!w-[80%] sm:!w-[45%] lg:!w-[30%]"
          >
            <div
              data-aos="zoom-in"
              className="flex rounded-b-full items-center justify-center  mb-10 flex-col w-[355px] gap-5 mx-auto"
            >
              <img
                src={proj.img}
                alt={proj.title}
                className="w-[200px] overflow-hidden object-contain"
              />
              <div
                className={`relative flex flex-col text-accent-foreground  -mt-6`}
              >
                <div className=" pt-1  flex flex-col gap-2 items-center justify-center text-center  ">
                  <h1
                    className={`text-2xl mt-2 font-almarai  font-bold flex text-center`}
                  >
                    <GradientText
                      colors={["#d23e3e", "#000000", "#d23e3e"]}
                      animationSpeed={3}
                      showBorder={false}
                      className="flex font-almarai text-center font-extrabold"
                    >
                      {proj.title}
                    </GradientText>
                  </h1>

                  <p className={`text-sm font-medium `}>{proj.desc}</p>
                </div>
              </div>
              <Button className="w-fit bg-background border border-primary text-primary duration-300 transition ease-in-out hover:text-background hover:bg-primary font-bold rounded-xs">
                {isArabic ? "قراءة القصة كاملة" : "Read full story"}
              </Button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProjectSlider;
