"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from "lucide-react";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "Name is required"),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email"),
    hash: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.hash === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      setIsLoading(true);
      setServerError(""); // Clear previous server errors

      // Combine first and last name for the API
      const fullName = `${data.firstName}${data.lastName ? ' ' + data.lastName : ''}`;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: data.email,
          password: data.hash, // API expects "password" not "hash"
          role: "USER", // Default role as expected by API
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setServerError(errorData.error || "Registration failed");
        return;
      }

      // ✅ If successful, redirect to signin
      router.push("/signin?message=Registration successful! Please sign in.");

    } catch (err) {
      console.error("Registration error:", err);
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen == flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-accent-foreground mb-2">
            Create account
          </h2>
          <p className="text-gray-600">Join us today and get started</p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <label
                htmlFor="firstName"
                className="block text-sm font-semibold text-foreground mb-3"
              >
                First Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200">
                  <User
                    className={`h-5 w-5 ${isFocused.firstName ? "text-primary" : "text-muted-foreground"} transition-colors duration-200`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Enter your first name"
                  {...register("firstName")}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, firstName: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, firstName: false }))
                  }
                  className={`block w-full pl-10 pr-3 py-4 border-2 ${isFocused.firstName ? "border-primary ring-4 ring-primary/10" : "border-border"} rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200 bg-background hover:border-primary/50`}
                  disabled={isLoading}
                />
              </div>
              {errors.firstName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive text-sm mt-2 flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-destructive/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-destructive text-xs font-bold">
                      !
                    </span>
                  </div>
                  <span>{errors.firstName.message}</span>
                </motion.p>
              )}
            </motion.div>

            {/* Last Name Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <label
                htmlFor="lastName"
                className="block text-sm font-semibold text-foreground mb-3"
              >
                Last Name{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200">
                  <User
                    className={`h-5 w-5 ${isFocused.lastName ? "text-primary" : "text-muted-foreground"} transition-colors duration-200`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Enter your last name"
                  {...register("lastName")}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, lastName: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, lastName: false }))
                  }
                  className={`block w-full pl-10 pr-3 py-4 border-2 ${isFocused.lastName ? "border-primary ring-4 ring-primary/10" : "border-border"} rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200 bg-background hover:border-primary/50`}
                  disabled={isLoading}
                />
              </div>
              {errors.lastName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive text-sm mt-2 flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-destructive/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-destructive text-xs font-bold">
                      !
                    </span>
                  </div>
                  <span>{errors.lastName.message}</span>
                </motion.p>
              )}
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-foreground mb-3"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200">
                  <Mail
                    className={`h-5 w-5 ${isFocused.email ? "text-primary" : "text-muted-foreground"} transition-colors duration-200`}
                  />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, email: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, email: false }))
                  }
                  className={`block w-full pl-10 pr-3 py-4 border-2 ${isFocused.email ? "border-primary ring-4 ring-primary/10" : "border-border"} rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200 bg-background hover:border-primary/50`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive text-sm mt-2 flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-destructive/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-destructive text-xs font-bold">
                      !
                    </span>
                  </div>
                  <span>{errors.email.message}</span>
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-foreground mb-3"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200">
                  <Lock
                    className={`h-5 w-5 ${isFocused.password ? "text-primary" : "text-muted-foreground"} transition-colors duration-200`}
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  {...register("hash")}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, password: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, password: false }))
                  }
                  className={`block w-full pl-10 pr-12 py-4 border-2 ${isFocused.password ? "border-primary ring-4 ring-primary/10" : "border-border"} rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200 bg-background hover:border-primary/50`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
                  )}
                </button>
              </div>
              {errors.hash && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive text-sm mt-2 flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-destructive/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-destructive text-xs font-bold">
                      !
                    </span>
                  </div>
                  <span>{errors.hash.message}</span>
                </motion.p>
              )}
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-foreground mb-3"
              >
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200">
                  <Lock
                    className={`h-5 w-5 ${isFocused.confirmPassword ? "text-primary" : "text-muted-foreground"} transition-colors duration-200`}
                  />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  {...register("confirmPassword")}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, confirmPassword: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({
                      ...prev,
                      confirmPassword: false,
                    }))
                  }
                  className={`block w-full pl-10 pr-12 py-4 border-2 ${isFocused.confirmPassword ? "border-primary ring-4 ring-primary/10" : "border-border"} rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200 bg-background hover:border-primary/50`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive text-sm mt-2 flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-destructive/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-destructive text-xs font-bold">
                      !
                    </span>
                  </div>
                  <span>{errors.confirmPassword.message}</span>
                </motion.p>
              )}
            </motion.div>

            {/* Server Error */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl text-sm flex items-start gap-3"
              >
                <div className="w-5 h-5 bg-destructive/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-destructive text-xs font-bold">!</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Registration Error</h3>
                  <p className="mt-1">{serverError}</p>
                </div>
                <button
                  onClick={() => setServerError("")}
                  className="shrink-0 p-1 hover:bg-destructive/10 rounded-md transition-colors duration-200"
                  title="Dismiss error"
                  aria-label="Dismiss error message"
                >
                  <span className="text-destructive text-lg leading-none">
                    ×
                  </span>
                </button>
              </motion.div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white transition-all duration-200 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </motion.div>

        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center"
        >
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
            <p className="text-muted-foreground text-sm mb-3">
              Already have an account?
            </p>
            <button
              onClick={() => router.push("/signin")}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors duration-200 hover:gap-3"
            >
              Sign in here
              <User className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
