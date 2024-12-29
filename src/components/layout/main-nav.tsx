"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "仪表盘",
    icon: LayoutDashboard
  },
  {
    href: "/courses",
    label: "课程",
    icon: BookOpen
  },
  {
    href: "/learn",
    label: "学习",
    icon: GraduationCap
  },
  {
    href: "/profile",
    label: "个人中心",
    icon: User
  }
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0 md:h-16">
      <div className="grid grid-cols-4 md:flex md:justify-between md:items-center max-w-6xl mx-auto px-4 py-2 md:py-0 md:h-full">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                "flex flex-col items-center justify-center h-full w-full md:flex-row md:justify-start md:gap-2 md:px-4 md:py-0 md:h-full",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5 mb-1 md:mr-2 md:mb-0" />
              <span className="text-xs md:text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
