"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Course, User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { CoursePublishButton } from "./course-publish-button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CourseHeaderProps {
  course: Course & {
    instructor: Pick<User, "id" | "name" | "email">;
  };
  isInstructor: boolean;
}

export function CourseHeader({ course, isInstructor }: CourseHeaderProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("确定要删除这个课程吗？此操作无法撤销。")) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除课程失败");
      }

      router.push("/courses");
      router.refresh();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("删除课程时发生错误");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/courses">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{course.title}</h1>
        </div>
        {isInstructor && (
          <div className="flex items-center space-x-2">
            {!course.published && (
              <CoursePublishButton 
                courseId={course.id} 
                initialPrice={course.price}
                disabled={course.sections.length === 0}
                onPublishSuccess={(courseId) => {
                  router.push(`/courses/${courseId}`);
                  router.refresh();
                }}
              />
            )}
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              删除课程
            </Button>
          </div>
        )}
      </div>
      {!course.published && isInstructor && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            此课程尚未发布，只有您能看到。发布后学生才能报名学习。
          </p>
        </div>
      )}
    </div>
  );
}
