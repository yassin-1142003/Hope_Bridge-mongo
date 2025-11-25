import nodemailer from "nodemailer";
import { env } from "./env.js";

const secure = env.SMTP_PORT === "465";
const fromAddress = env.SMTP_NAME
  ? `${env.SMTP_NAME} <${env.SMTP_EMAIL}>`
  : env.SMTP_EMAIL;

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure,
  auth: {
    user: env.SMTP_EMAIL,
    pass: env.SMTP_PASSWORD,
  },
});

export async function sendNewProjectEmail(to, project) {
  const subject = `New Charity Project: ${project.title}`;

  const html = `
    <h1>New Charity Project</h1>
    <p><strong>${project.title}</strong></p>
    <p>${project.description}</p>
    ${project.image ? `<p><img src="${project.image}" alt="${project.title}" style="max-width: 100%;" /></p>` : ""}
    ${project.link ? `<p><a href="${project.link}">View project</a></p>` : ""}
  `;

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  });
}

export async function sendAnnouncementEmail(to, payload) {
  const subject = payload.title;

  const html = `
    <h1>${payload.title}</h1>
    <p>${payload.message}</p>
  `;

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  });
}
