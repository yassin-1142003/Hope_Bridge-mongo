import fs from "fs";
import path from "path";

type TranslationObject = {
  [key: string]: string | TranslationObject; // recursive type for nested translations
};

/**
 * Loads translations for a given locale and optional namespace.
 * Example: getTranslations("en", "HomePage")
 */
export async function getTranslations(
  locale: string,
  namespace?: string
): Promise<TranslationObject> {
  const filePath = path.join(process.cwd(), "locales", `${locale}.json`);

  // Read and parse the JSON file
  const fileContents = await fs.promises.readFile(filePath, "utf-8");
  const translations: TranslationObject = JSON.parse(fileContents);

  // If namespace provided, return only that section
  if (namespace) {
    const section = translations[namespace];
    if (typeof section === "object" && section !== null) {
      return section as TranslationObject;
    }
    return {};
  }

  // Otherwise return full translation object
  return translations;
}
