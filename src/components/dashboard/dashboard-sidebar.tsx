"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  User 
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const DASHBOARD_NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "总览",
    icon: LayoutDashboard
  },
  {
    href: "/courses",
    label: "我的课程",
    icon: BookOpen
  },
  {
    href: "/learn",
    label: "学习中心",
    icon: GraduationCap
  },
  {
    href: "/profile",
    label: "个人中心",
    icon: User
  },
  {
    href: "/settings",
    label: "系统设置",
    icon: Settings
  }
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:block w-64 bg-background border-r p-4 space-y-2">
      <h2 className="text-xl font-bold mb-6 pl-4">学习平台</h2>
      {DASHBOARD_NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
              "w-full justify-start",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
