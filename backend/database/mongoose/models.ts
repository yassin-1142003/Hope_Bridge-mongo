import mongoose, { Schema, Document } from "mongoose";
import { connectDb } from "./connection";
import { PostCategoryName, PostCategoryNameArr } from "./enums";

/* ------------------ USER ------------------ */
export interface UsrData {
  id: string;
  email: string;
  hash: string;
  role: string;
  firstName: string;
  lastName: string | null;
  created_at: Date;
  updated_at: Date;
}
export type NewUsrData = Omit<UsrData, "id" | "created_at">;

interface UserDoc extends Document {
  email: string;
  hash: string;
  role: string;
  firstName: string;
  lastName?: string;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true },
    hash: { type: String, required: true },
    role: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
  },
  {
    collection: "usr",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
userSchema.index({ created_at: -1 });
userSchema.index({ role: 1 });

export const UserModel =
  (mongoose.models.User as any) || mongoose.model<UserDoc>("User", userSchema);

export function toUsrData(doc: UserDoc): UsrData {
  return {
    id: String(doc._id),
    email: doc.email,
    hash: doc.hash,
    role: doc.role,
    firstName: doc.firstName,
    lastName: doc.lastName ?? null,
    created_at: doc.created_at ?? new Date(),
    updated_at: doc.updated_at ?? doc.created_at ?? new Date(),
  };
}

/* ------------------ POST ------------------ */
export interface PostContent {
  language_code: string;
  name: string;
  description: string;
  content: string;
}

export interface Post {
  id: string;
  created_at: Date;
  updated_at: Date;
  category: PostCategoryName;
  contents: PostContent[];
  images: string[];
  videos: string[];
  status: "draft" | "published" | "archived";
  slug?: string | null;
}

export type NewPost = Omit<Post, "id" | "created_at" | "updated_at">;

interface PostDoc extends Document {
  created_at: Date;
  updated_at: Date;
  category: PostCategoryName;
  contents: PostContent[];
  images: string[];
  videos: string[];
  status: "draft" | "published" | "archived";
  slug?: string | null;
}

const postContentSchema = new Schema<PostContent>(
  {
    language_code: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
  },
  { _id: false }
);

const postSchema = new Schema<PostDoc>(
  {
    category: { type: String, enum: PostCategoryNameArr, required: true },
    contents: { type: [postContentSchema], default: [] },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    slug: { type: String, default: null },
  },
  {
    collection: "post",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
postSchema.index({ category: 1, created_at: -1 });
postSchema.index({ slug: 1 }, { sparse: true });
postSchema.index({ status: 1, created_at: -1 });
postSchema.index({ created_at: -1, _id: -1 });

export const PostModel =
  (mongoose.models.Post as any) || mongoose.model<PostDoc>("Post", postSchema);

export function toPost(doc: PostDoc): Post {
  return {
    id: String(doc._id),
    created_at: doc.created_at ?? new Date(),
    updated_at: doc.updated_at ?? doc.created_at ?? new Date(),
    category: doc.category,
    contents: doc.contents ?? [],
    images: doc.images ?? [],
    videos: doc.videos ?? [],
    status: doc.status ?? "published",
    slug: doc.slug ?? null,
  };
}

/* ------------------ MEDIA ------------------ */
export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploaded_at: Date;
  updated_at: Date;
}

export type NewMediaFile = Omit<MediaFile, "id" | "uploaded_at" | "updated_at">;

interface MediaDoc extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploaded_at: Date;
  updated_at: Date;
}

const mediaSchema = new Schema<MediaDoc>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
  },
  {
    collection: "media",
    timestamps: { createdAt: "uploaded_at", updatedAt: "updated_at" },
  }
);
mediaSchema.index({ uploaded_at: -1 });

export const MediaModel =
  (mongoose.models.Media as any) ||
  mongoose.model<MediaDoc>("Media", mediaSchema);

export function toMedia(doc: MediaDoc): MediaFile {
  return {
    id: String(doc._id),
    filename: doc.filename,
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    size: doc.size,
    url: doc.url,
    uploaded_at: doc.uploaded_at ?? new Date(),
    updated_at: doc.updated_at ?? doc.uploaded_at ?? new Date(),
  };
}

/* ------------------ PROJECT ------------------ */
export interface ProjectContent {
  language_code: string;
  name: string;
  description: string;
  content: string;
  images: string[]; // Array of media file IDs
  videos: string[]; // Array of media file IDs
  documents: string[]; // Array of media file IDs
}

export interface Project {
  id: string;
  bannerPhotoUrl: string;
  bannerPhotoId?: string; // Reference to media file
  gallery: string[]; // Array of media file IDs
  created_at: Date;
  updated_at: Date;
  contents: ProjectContent[];
  status: "draft" | "published" | "archived";
  slug?: string | null;
}

export type NewProject = Omit<Project, "id" | "created_at" | "updated_at">;

interface ProjectDoc extends Document {
  bannerPhotoUrl: string;
  bannerPhotoId?: string;
  gallery: string[];
  created_at: Date;
  updated_at: Date;
  contents: ProjectContent[];
  status: "draft" | "published" | "archived";
  slug?: string | null;
}

const projectContentSchema = new Schema<ProjectContent>(
  {
    language_code: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    documents: { type: [String], default: [] },
  },
  { _id: false }
);

const projectSchema = new Schema<ProjectDoc>(
  {
    bannerPhotoUrl: { type: String, required: true },
    bannerPhotoId: { type: String },
    gallery: { type: [String], default: [] },
    contents: { type: [projectContentSchema], default: [] },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    slug: { type: String, default: null },
  },
  {
    collection: "project",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
projectSchema.index({ created_at: -1, _id: -1 });
projectSchema.index({ slug: 1 }, { sparse: true });
projectSchema.index({ status: 1, created_at: -1 });

export const ProjectModel =
  (mongoose.models.Project as any) ||
  mongoose.model<ProjectDoc>("Project", projectSchema);

export function toProject(doc: ProjectDoc): Project {
  return {
    id: String(doc._id),
    bannerPhotoUrl: doc.bannerPhotoUrl,
    bannerPhotoId: doc.bannerPhotoId,
    gallery: doc.gallery ?? [],
    created_at: doc.created_at ?? new Date(),
    updated_at: doc.updated_at ?? doc.created_at ?? new Date(),
    contents: doc.contents ?? [],
    status: doc.status ?? "published",
    slug: doc.slug ?? null,
  };
}

/* ------------------ CONTACT MESSAGE ------------------ */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: Date;
  updated_at: Date;
  status: "new" | "resolved";
}

export type NewContactMessage = Omit<
  ContactMessage,
  "id" | "created_at" | "updated_at"
>;

interface ContactDoc extends Document {
  name: string;
  email: string;
  message: string;
  created_at: Date;
  updated_at: Date;
  status: "new" | "resolved";
}

const contactSchema = new Schema<ContactDoc>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "resolved"], default: "new" },
  },
  {
    collection: "contact_message",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
contactSchema.index({ created_at: -1 });

export const ContactModel =
  (mongoose.models.ContactMessage as any) ||
  mongoose.model<ContactDoc>("ContactMessage", contactSchema);

export function toContactMessage(doc: ContactDoc): ContactMessage {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    message: doc.message,
    created_at: doc.created_at ?? new Date(),
    updated_at: doc.updated_at ?? doc.created_at ?? new Date(),
    status: doc.status ?? "new",
  };
}

/* ------------------ Init helper ------------------ */
export async function initMongo() {
  await connectDb();
}

/* Legacy placeholders for removed Drizzle media types */
export type PostMediaSelect = never;
export type PostMediaInsert = never;

/* ------------------ VISIT LOG ------------------ */
export interface Visit {
  id: string;
  path: string;
  locale: string | null;
  projectId: string | null;
  referrer: string | null;
  userAgent: string | null;
  ipHash: string | null;
  country: string | null;
  created_at: Date;
  updated_at: Date;
}

export type NewVisit = Omit<Visit, "id" | "created_at" | "updated_at"> & {
  created_at?: Date;
};

interface VisitDoc extends Document {
  path: string;
  locale?: string | null;
  projectId?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  ipHash?: string | null;
  country?: string | null;
  created_at: Date;
  updated_at: Date;
}

const visitSchema = new Schema<VisitDoc>(
  {
    path: { type: String, required: true },
    locale: { type: String, default: null },
    projectId: { type: String, default: null },
    referrer: { type: String, default: null },
    userAgent: { type: String, default: null },
    ipHash: { type: String, default: null },
    country: { type: String, default: null },
  },
  {
    collection: "visit_logs",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
visitSchema.index({ created_at: -1, _id: -1 });
visitSchema.index({ projectId: 1, created_at: -1 });
visitSchema.index({ path: 1, created_at: -1 });
visitSchema.index({ ipHash: 1 }, { sparse: true });

export const VisitModel =
  (mongoose.models.VisitLog as any) ||
  mongoose.model<VisitDoc>("VisitLog", visitSchema);

export function toVisit(doc: VisitDoc): Visit {
  return {
    id: String(doc._id),
    path: doc.path,
    locale: doc.locale ?? null,
    projectId: doc.projectId ?? null,
    referrer: doc.referrer ?? null,
    userAgent: doc.userAgent ?? null,
    ipHash: doc.ipHash ?? null,
    country: doc.country ?? null,
    created_at: doc.created_at ?? new Date(),
    updated_at: doc.updated_at ?? doc.created_at ?? new Date(),
  };
}
