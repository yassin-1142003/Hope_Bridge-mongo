import { getTranslations } from "next-intl/server";
import StorySlider from "@/components/storySlider";
const Stories = async ({
  params: { locale },
}: {
  params: { locale: string };
}) => {
  const stories = await getTranslations({ locale, namespace: "Stories" });
  return (
    <section className="flex  px-3 flex-col overflow-hidden ">
      <div className="flex flex-col  gap-1 md:gap-3  text-center">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-wider text-primary ">
          {stories("title")}
        </h1>
        <p className="px-4 md:px-8 text-md md:text-xl text-center text-accent-foreground lg:text-2xl font-semibold ">
          {stories("subtitle")}
        </p>
        <div className="flex  justify-center items-center">
          <StorySlider />
        </div>
      </div>
    </section>
  );
};

export default Stories;
