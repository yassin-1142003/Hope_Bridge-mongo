"use client";
import React from "react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import RoleBasedTaskDashboard from "@/components/dashboard/RoleBasedTaskDashboard";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TasksPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/${locale}/dashboard`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </motion.button>
            </Link>
            
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {locale === 'ar' ? 'إدارة المهام' : 'Task Management'}
                </h1>
                <p className="text-white/70">
                  {locale === 'ar' ? 'نظام إدارة المهام المستند إلى الأدوار' : 'Role-based task management system'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Task Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
            <RoleBasedTaskDashboard className="w-full" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
