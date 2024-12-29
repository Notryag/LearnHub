"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              在线学习平台
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className={pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"}
            >
              仪表板
            </Link>
            <Link
              href="/courses"
              className={pathname === "/courses" ? "text-foreground" : "text-foreground/60"}
            >
              课程
            </Link>
            <Link
              href="/assignments"
              className={pathname === "/assignments" ? "text-foreground" : "text-foreground/60"}
            >
              作业
            </Link>
            <Link
              href="/exams"
              className={pathname === "/exams" ? "text-foreground" : "text-foreground/60"}
            >
              考试
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* 这里可以添加搜索功能 */}
          </div>
          <nav className="flex items-center">
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                >
                  退出
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                登录
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
