import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  tags?: string[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>("SMTP_HOST");
    const portStr = this.config.get<string>("SMTP_PORT");
    const user = this.config.get<string>("SMTP_USER");
    const pass = this.config.get<string>("SMTP_PASS");

    if (host && user && pass) {
      const port = portStr ? Number(portStr) : 587;
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  private async sendInternal(options: SendMailOptions) {
    if (!this.transporter) {
      this.logger.warn("SMTP transport is not configured; email not sent.");
      return;
    }

    const from =
      this.config.get<string>("EMAIL_FROM") ||
      this.config.get<string>("SMTP_USER") ||
      "no-reply@example.com";

    const subjectWithTags = options.tags?.length
      ? `[${options.tags.join(",")}] ${options.subject}`
      : options.subject;

    await this.transporter.sendMail({
      from,
      to: options.to,
      subject: subjectWithTags,
      html: options.html,
    });
  }

  async sendMail(options: SendMailOptions) {
    await this.sendInternal(options);
  }

  async sendVerificationEmail(to: string, link: string) {
    await this.sendInternal({
      to,
      subject: "Verify your account",
      html: `<p>Please verify your account by clicking <a href="${link}">this link</a>.</p>`,
      tags: ["verify"],
    });
  }

  async sendPasswordResetEmail(to: string, link: string) {
    await this.sendInternal({
      to,
      subject: "Reset your password",
      html: `<p>You can reset your password by clicking <a href="${link}">this link</a>.</p>`,
      tags: ["reset"],
    });
  }

  async sendAdminNotification(subject: string, body: string) {
    const adminEmail = this.config.get<string>("EMAIL_FROM");
    if (!adminEmail) {
      this.logger.warn("EMAIL_FROM is not configured; admin notification skipped.");
      return;
    }

    await this.sendInternal({
      to: adminEmail,
      subject,
      html: `<pre>${body}</pre>`,
      tags: ["admin"],
    });
  }
}
