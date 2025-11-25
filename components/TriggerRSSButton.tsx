"use client";

import { useState } from "react";
interface TriggerRSSButtonProps {
  projectId: string;
  projectName?: string;
}
export default function TriggerRSSButton({
  projectId,
  projectName = "المشروع",
}: TriggerRSSButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);

  const handleTrigger = async () => {
    setIsLoading(true);
    setMessage("جاري تحديث RSS...");

    try {
      const response = await fetch("/api/trigger-rss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ project_id: projectId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          "✅ تم تحديث RSS بنجاح! سيتم نشر المشروع على فيسبوك خلال 15 دقيقة."
        );
        setLastTriggered(
          new Date().toLocaleString("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        );

        // Auto-clear success message after 10 seconds
        setTimeout(() => {
          setMessage("");
        }, 10000);
      } else {
        setMessage(`❌ فشل في تحديث RSS: ${data.error}`);
      }
    } catch (error) {
      console.error("Trigger error:", error);
      setMessage(`❌ خطأ في الاتصال: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyRssUrl = () => {
    const rssUrl = `${window.location.origin}/api/rss`;
    navigator.clipboard
      .writeText(rssUrl)
      .then(() => {
        setMessage("📋 تم نسخ رابط RSS");
        setTimeout(() => setMessage(""), 3000);
      })
      .catch(() => {
        setMessage("❌ فشل في نسخ الرابط");
      });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Trigger Button */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-accent-foreground mb-2">
            🚀 نشر على فيسبوك
          </h3>
          <p className="text-sm text-gray-600">{projectName}</p>
        </div>

        <button
          onClick={handleTrigger}
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed transform scale-95"
              : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              جاري النشر...
            </div>
          ) : (
            "📢 نشر المشروع الآن"
          )}
        </button>

        {/* Status Message */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm transition-all duration-300 ${
              message.includes("✅")
                ? "bg-green-50 text-green-800 border border-green-200"
                : message.includes("📋")
                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                  : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-1">{message}</div>
            </div>
          </div>
        )}

        {/* Last Triggered Info */}
        {lastTriggered && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            آخر تحديث: {lastTriggered}
          </div>
        )}
      </div>

      {/* Additional Options */}
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <div className="flex flex-col space-y-2">
          <button
            onClick={copyRssUrl}
            className="flex items-center justify-center py-2 px-4 text-sm text-gray-600 hover:text-accent-foreground transition-colors"
          >
            📋 نسخ رابط RSS
          </button>

          <div className="text-xs text-gray-500 text-center">
            <p>• IFTTT يتحقق من RSS كل 15 دقيقة</p>
            <p>• تأكد من أن ملفات Google Drive مشاركة للعامة</p>
          </div>
        </div>
      </div>

      {/* Testing Links */}
      <div className="mt-4 text-center">
        <a
          href="/api/rss"
          target="_blank"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          🔗 عرض RSS Feed
        </a>
        <span className="text-gray-400 mx-2">|</span>
        <a
          href={`/api/trigger-rss?project_id=${projectId}`}
          target="_blank"
          className="text-sm text-green-600 hover:text-green-800 underline"
        >
          🧪 اختبار Trigger
        </a>
      </div>
    </div>
  );
}

// /app/projects/[id]/page.tsx - Example usage
