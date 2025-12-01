"use client";
import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = React.use(params); // unwrap the params promise
  const isArabic = locale === "ar";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      setError(isArabic ? "يرجى ملء جميع الحقول" : "Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      await login(formData.email, formData.password);

      // ✅ If successful, redirect to dashboard
      router.push(`/${locale}/dashboard`);
      router.refresh();

    } catch (err) {
      console.error("Sign in error:", err);
      setError(
        isArabic
          ? "حدث خطأ ما. يرجى المحاولة مرة أخرى."
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-linear-to-br from-background via-background to-muted/20 ${isArabic ? "rtl" : "ltr"}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center"
        >
          <div className="mx-auto h-20 w-20 bg-linear-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-primary/20 backdrop-blur-sm">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3 bg-linear-to-r from-primary to-primary/60 bg-clip-text">
            {isArabic ? "مرحباً بعودتك" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isArabic
              ? "سجل دخولك للوصول إلى حسابك"
              : "Sign in to access your account"}
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-foreground mb-3"
              >
                {isArabic ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 ${isArabic ? "right-0 pr-3" : "left-0 pl-3"} flex items-center pointer-events-none transition-colors duration-200`}
                >
                  <Mail
                    className={`h-5 w-5 ${isFocused.email ? "text-primary" : "text-muted-foreground"} transition-colors duration-200`}
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, email: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, email: false }))
                  }
                  className={`block w-full ${isArabic ? "pr-10 pl-3" : "pl-10 pr-3"} py-4 border-2 ${isFocused.email ? "border-primary ring-4 ring-primary/10" : "border-border"} rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200 bg-background hover:border-primary/50`}
                  placeholder={
                    isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"
                  }
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-foreground mb-3"
              >
                {isArabic ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 ${isArabic ? "right-0 pr-3" : "left-0 pl-3"} flex items-center pointer-events-none transition-colors duration-200`}
                >
                  <Lock
                    className={`h-5 w-5 ${isFocused.password ? "text-primary" : "text-muted-foreground"} transition-colors duration-200`}
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, password: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, password: false }))
                  }
                  className={`block w-full ${isArabic ? "pr-10 pl-12" : "pl-10 pr-12"} py-4 border-2 ${isFocused.password ? "border-primary ring-4 ring-primary/10" : "border-border"} rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200 bg-background hover:border-primary/50`}
                  placeholder={
                    isArabic ? "أدخل كلمة المرور" : "Enter your password"
                  }
                />
                <button
                  type="button"
                  className={`absolute inset-y-0 ${isArabic ? "left-0 pl-3" : "right-0 pr-3"} flex items-center transition-colors duration-200`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl text-sm flex items-center gap-3"
              >
                <div className="w-5 h-5 bg-destructive/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-destructive text-xs font-bold">!</span>
                </div>
                <span>{error}</span>
              </motion.div>
            )}

            {/* Sign In Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="pt-2"
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-foreground font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 border-0"
              >
                {isLoading ? (
                  <div className="flex  items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
                    <span>
                      {isArabic ? "جاري تسجيل الدخول..." : "Signing In..."}
                    </span>
                  </div>
                ) : (
                  <span className="flex text-background items-center justify-center gap-2">
                    {isArabic ? "تسجيل الدخول" : "Sign In"}
                    <Lock className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </motion.div>

            {/* Forgot Password */}
            <div className="text-center">
              {/* <Link
                href="/auth/forgot-password"
                className="text-sm text-primary/60 hover:text-primary/70 font-medium transition-colors duration-200 hover:underline"
              >
                Forgot your password?
              </Link> */}
            </div>
          </form>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
            <p className="text-muted-foreground text-sm mb-3">
              {isArabic ? "ليس لديك حساب؟" : "Don't have an account?"}
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors duration-200 hover:gap-3"
            >
              {isArabic ? "إنشاء حساب جديد" : "Create a new account"}
              <User className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
