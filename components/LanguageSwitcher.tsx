"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const changeLanguage = (lang: string) => {
    // Save preference
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `manual-locale=${lang}; path=/; expires=${expires.toUTCString()}`;

    // Navigate to new language
    const currentPath = pathname.replace(/^\/(ar|en)/, "") || "";
    const newPath = `/${lang}${currentPath}`;
    router.push(newPath, { scroll: false });
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setOpen((prev) => !prev);
          }}
          className="flex items-center  cursor-pointer gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          <Globe className="h-4 w-4 text-primary" />
          <span className="uppercase">{locale}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-20 "
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className={`${locale === "en" ? "bg-primary/10" : ""} cursor-pointer`}
        >
          EN
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("ar")}
          className={`${locale === "ar" ? "bg-primary/10" : ""} cursor-pointer`}
        >
          AR
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
