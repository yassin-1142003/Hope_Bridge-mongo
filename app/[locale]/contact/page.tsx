"use client";

import { useState } from "react";
import {
  Send,
  CheckCircle,
  XCircle,
  Mail,
  User,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

type FormData = {
  name: string;
  email: string;
  message: string;
  honeypot: string;
};
type StatusType = "" | "success" | "error";

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
    honeypot: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusType>("");

  const { locale } = useParams() as { locale: "ar" | "en" };
  const isArabic = locale === "ar";

  const t = {
    en: {
      title: "Let’s Connect",
      subtitle:
        "Whether you have a question, an idea, or just want to say hello — we’re here to listen.",
      leftTitle: "Let’s Build Hope Together",
      leftText:
        "Every message brings us closer to helping more families in need.",
      formTitle: "Send a Message",
      formSubtitle:
        "Fill in the form below and our team will get back to you shortly.",
      name: "Your Name",
      email: "Your Email",
      message: "Write your message...",
      send: "Send Message",
      sending: "Sending...",
      success: "Message sent successfully! We’ll get back to you soon.",
      error: "Failed to send message. Please try again later.",
    },
    ar: {
      title: "تواصل معنا",
      subtitle:
        "سواء كان لديك سؤال أو فكرة أو ترغب فقط في إلقاء التحية — نحن هنا للاستماع.",
      leftTitle: "لنصنع الأمل معًا",
      leftText: "كل رسالة تقربنا أكثر من مساعدة المزيد من العائلات المحتاجة.",
      formTitle: "أرسل رسالة",
      formSubtitle: "املأ النموذج أدناه وسنعاود الاتصال بك قريبًا.",
      name: "اسمك",
      email: "بريدك الإلكتروني",
      message: "اكتب رسالتك...",
      send: "إرسال الرسالة",
      sending: "جارٍ الإرسال...",
      success: "تم إرسال الرسالة بنجاح! سنتواصل معك قريبًا.",
      error: "فشل في إرسال الرسالة. حاول مرة أخرى لاحقًا.",
    },
  }[locale];

  async function handleSubmit(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    // Honeypot check before sending
    if (formData.honeypot.trim() !== "") {
      console.warn("Bot detected - honeypot filled");
      setLoading(false);
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "", honeypot: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl text-primary dark:text-white font-bold"
        >
          {t.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto"
        >
          {t.subtitle}
        </motion.p>
      </section>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Image */}
        <motion.div
          initial={{ opacity: 0, x: isArabic ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative h-[550px] rounded-3xl overflow-hidden shadow-2xl"
        >
          <Image
            src="/contact.jpg"
            fill
            alt="HopeBridge contact workspace"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/70 to-transparent" />
          <div
            className={`absolute bottom-8 ${
              isArabic ? "right-8 text-right" : "left-8"
            } text-white`}
          >
            <h3 className="text-3xl font-semibold mb-2">{t.leftTitle}</h3>
            <p className="text-white/90 text-lg leading-relaxed">
              {t.leftText}
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          dir={isArabic ? "rtl" : "ltr"}
          initial={{ opacity: 0, x: isArabic ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 backdrop-blur-lg"
        >
          <h2 className="text-3xl font-bold text-primary dark:text-white mb-3">
            {t.formTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {t.formSubtitle}
          </p>

          <div className="space-y-6">
            {/* Name */}
            <div className="relative">
              <User
                className={`${isArabic ? "right-4" : "left-4"} top-4 absolute text-primary w-5 h-5`}
              />
              <input
                type="text"
                placeholder={t.name}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className={`w-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-accent-foreground dark:text-white rounded-xl p-4 ${
                  isArabic ? "pr-12" : "pl-12"
                } focus:outline-none focus:border-primary transition-all`}
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail
                className={`${isArabic ? "right-4" : "left-4"} top-4 absolute text-primary w-5 h-5`}
              />
              <input
                type="email"
                placeholder={t.email}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className={`w-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-accent-foreground dark:text-white rounded-xl p-4 ${
                  isArabic ? "pr-12" : "pl-12"
                } focus:outline-none focus:border-primary transition-all`}
              />
            </div>

            {/* Message */}
            <div className="relative">
              <MessageSquare
                className={`${isArabic ? "right-4" : "left-4"} top-4 absolute text-primary w-5 h-5`}
              />
              <textarea
                placeholder={t.message}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
                rows={5}
                className={`w-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-accent-foreground dark:text-white rounded-xl p-4 ${
                  isArabic ? "pr-12" : "pl-12"
                } focus:outline-none focus:border-primary transition-all resize-none`}
              />
            </div>

            {/* 🕵️ Honeypot Field (hidden from humans) */}
            <div
              style={{
                position: "absolute",
                left: "-9999px",
                width: "1px",
                height: "1px",
                overflow: "hidden",
              }}
              aria-hidden="true"
            >
              <label>Leave this field empty</label>
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={(e) =>
                  setFormData({ ...formData, honeypot: e.target.value })
                }
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <span>{t.sending}</span>
              ) : (
                <>
                  <span>{t.send}</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {/* Status */}
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{t.success}</span>
              </motion.div>
            )}
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800"
              >
                <XCircle className="w-5 h-5" />
                <span>{t.error}</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
