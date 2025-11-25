// /lib/drive.ts
export const getDriveImageUrl = (url: string): string => {
  const match = url?.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const id = match ? match[1] : null;
  return id
    ? `https://drive.google.com/uc?export=view&id=${id}`
    : url || "https://placehold.net/600x400.png?text=No+Image";
};
