export default function robots() {
  const baseUrl = "https://hopebridgecharity.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/contact",
          "/projects"
        ],
        disallow: [
          "/api/",
          "/auth/",
          "/login/",
          "/register/",
          "/dashboard/"
        ],
        crawlDelay: 5,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
