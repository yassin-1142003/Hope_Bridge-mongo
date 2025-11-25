export const PostCategoryNameArr = ["news", "project", "story"] as const;
export type PostCategoryName = (typeof PostCategoryNameArr)[number];

export const PostMediaTypeNameArr = ["img", "video"] as const;
export type PostMediaTypeName = (typeof PostMediaTypeNameArr)[number];
