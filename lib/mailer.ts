import nodemailer from "nodemailer";
import type { Project } from "@/backend/database/mongoose/models";

type BulkEmailPayload = {
  recipients: string[];
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
  batchSize?: number;
  fromName?: string;
};

type ProjectUpdateEmailPayload = {
  project: Project;
  recipients: string[];
  title?: string;
  summary?: string;
  body?: string;
  highlights?: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  bannerUrl?: string;
  previewText?: string;
};

const DEFAULT_BATCH_SIZE = Number(process.env.EMAIL_BATCH_SIZE ?? 50);
const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.APP_BASE_URL ||
  process.env.BASE_URL ||
  "http://localhost:3000";

let cachedTransporter: nodemailer.Transporter | null = null;

function assertEmailCredentials() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be configured to send emails.");
  }
}

function getTransporter(): nodemailer.Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  assertEmailCredentials();

  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure =
    typeof process.env.SMTP_SECURE === "string"
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return cachedTransporter;
}

function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function sendBulkEmail({
  recipients,
  subject,
  html,
  text,
  headers,
  batchSize,
  fromName,
}: BulkEmailPayload): Promise<void> {
  if (!recipients.length) {
    return;
  }

  assertEmailCredentials();

  const transporter = getTransporter();
  const fromAddress = process.env.EMAIL_FROM ?? process.env.EMAIL_USER ?? "";

  if (!fromAddress) {
    throw new Error("EMAIL_FROM or EMAIL_USER must be set to send emails.");
  }

  const batches = chunk(recipients, batchSize ?? DEFAULT_BATCH_SIZE);
  const from = fromName ? `"${fromName}" <${fromAddress}>` : fromAddress;
  const envelopeTo = process.env.EMAIL_TO_FALLBACK ?? fromAddress;

  for (const batch of batches) {
    await transporter.sendMail({
      from,
      to: envelopeTo,
      bcc: batch,
      subject,
      html,
      text,
      headers,
    });
  }
}

export async function sendProjectUpdateEmail({
  project,
  recipients,
  title,
  summary,
  body,
  highlights = [],
  ctaLabel,
  ctaUrl,
  bannerUrl,
  previewText,
}: ProjectUpdateEmailPayload): Promise<void> {
  if (!recipients.length) {
    return;
  }

  const targetLocale =
    process.env.DEFAULT_PROJECT_LOCALE ||
    process.env.NEXT_PUBLIC_DEFAULT_LOCALE ||
    "en";
  const localizedContent =
    project.contents?.find((content) => content.language_code === targetLocale) ??
    project.contents?.[0];

  const resolvedTitle =
    title ?? localizedContent?.name ?? "New HopeBridge Project Update";
  const resolvedSummary = summary ?? localizedContent?.description ?? "";
  const resolvedBody = body ?? localizedContent?.content ?? "";
  const resolvedBanner = bannerUrl ?? project.bannerPhotoUrl;

  const resolvedCtaUrl =
    ctaUrl ?? `${DEFAULT_BASE_URL.replace(/\/$/, "")}/projects/${project.id}`;
  const resolvedCtaLabel = ctaLabel ?? "View full update";

  const highlightList = highlights
    .filter((item) => !!item)
    .map((item) => `<li>${item}</li>`)
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
      <span style="display:none;">${previewText ?? resolvedSummary}</span>
      ${
        resolvedBanner
          ? `<div style="margin-bottom:24px;">
              <img src="${resolvedBanner}" alt="${resolvedTitle}" style="width:100%;max-width:640px;border-radius:12px;" />
            </div>`
          : ""
      }
      <p>Hi there,</p>
      <p>We have fresh updates from HopeBridge that we'd love to share with you.</p>
      <h2 style="font-size:20px;margin-bottom:8px;">${resolvedTitle}</h2>
      ${
        resolvedSummary
          ? `<p style="margin-bottom:16px;">${resolvedSummary}</p>`
          : ""
      }
      ${
        highlightList
          ? `<ul style="padding-left:20px;margin-bottom:20px;">${highlightList}</ul>`
          : ""
      }
      ${
        resolvedBody
          ? `<div style="margin-bottom:24px;white-space:pre-line;">${resolvedBody}</div>`
          : ""
      }
      <div style="margin:24px 0;">
        <a href="${resolvedCtaUrl}"
           style="background:#0f172a;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block;">
           ${resolvedCtaLabel}
        </a>
      </div>
      <p>Thank you for standing with us.<br />– The HopeBridge team</p>
    </div>
  `;

  const textSections = [
    resolvedTitle,
    resolvedSummary,
    resolvedBody,
    highlights.length
      ? `Highlights:\n${highlights.map((item) => `• ${item}`).join("\n")}`
      : "",
    `Read more: ${resolvedCtaUrl}`,
  ].filter(Boolean);

  await sendBulkEmail({
    recipients,
    subject: `HopeBridge Update: ${resolvedTitle}`,
    html,
    text: textSections.join("\n\n"),
    headers: {
      "X-Entity-Ref-ID": project.id,
      "X-Project-Update": "true",
    },
    fromName: "HopeBridge Updates",
  });
}

