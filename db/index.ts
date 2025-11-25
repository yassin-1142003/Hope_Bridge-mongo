type LanguageRow = { code: string };

// Simple in-memory list of languages used by the dashboard project page.
const LANGS: LanguageRow[] = [
  { code: "en" },
  { code: "ar" },
];

export const db = {
  select(_shape: { code: unknown }) {
    return {
      from(_table: unknown): Promise<LanguageRow[]> {
        return Promise.resolve(LANGS);
      },
    };
  },
};
