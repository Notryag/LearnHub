"use client";

import Link from "next/link";
import { Course, User } from "@prisma/client";
import { BookOpen, DollarSign } from "lucide-react";

interface CourseCardProps {
  course: Course & {
    instructor: { name: string | null };
    _count?: {
      enrollments?: number;
      sections?: number;
    };
  };
  sectionCount?: number;
}

export function CourseCard({ 
  course, 
  sectionCount 
}: CourseCardProps) {
  const sectionsCount = sectionCount ?? course._count?.sections ?? 0;

  return (
    <div className="group relative rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col space-y-2">
        <h3 className="font-semibold leading-none tracking-tight">
          <Link
            href={`/courses/${course.id}`}
            className="text-xl hover:underline"
          >
            {course.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description || "暂无描述"}
        </p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-x-2 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-muted-foreground">
            讲师：{course.instructor.name || "未知"}
          </span>
        </div>
        <div className="flex items-center gap-x-2 text-sm">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            章节：{sectionsCount} 个
          </span>
        </div>
        {course.published && (
          <div className="flex items-center gap-x-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              价格：{course.price.toFixed(2)} 元
            </span>
          </div>
        )}
      </div>
      {!course.published && (
        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
          未发布
        </div>
      )}
      <div className="absolute bottom-6 right-6">
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          查看详情
        </Link>
      </div>
    </div>
  );
}
