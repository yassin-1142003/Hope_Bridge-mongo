"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DeleteProjectButton({
  id,
  locale,
}: {
  id: string;
  locale: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isArabic = locale === "ar";

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/post/project/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to delete project");
      }

      toast.success("🗑️ Project deleted successfully!");

      router.push(`/${locale}/`);
    } catch (error) {
      console.error("❌ Delete error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete project"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          disabled={loading}
          className="  p-2 rounded-xl disabled:opacity-50"
        >
          <Trash2Icon className="w-6 h-6 cursor-pointer text-[#171717] dark:text-[#f1f1f1]" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle> {isArabic ? "حذف" : "Delete"}</AlertDialogTitle>
          <AlertDialogDescription>
            {isArabic
              ? "     هل تريد حذف هذا المشروع؟ هذه العملية لا يمكن التراجع عنها. سوف يحذف بشكل دائم وسيحذف جميع البيانات الخاصة به"
              : "This action cannot be undone. This will permanently deleted and remove all of its data."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 cursor-pointer hover:bg-red-700 text-muted-foreground"
            disabled={loading}
          >
            {loading
              ? isArabic
                ? "حذف..."
                : "Deleting..."
              : isArabic
              ? "حذف"
              : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
