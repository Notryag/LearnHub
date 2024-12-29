"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CourseEnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
}

export function CourseEnrollButton({
  courseId,
  isEnrolled,
}: CourseEnrollButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("报名失败");
      }

      router.refresh();
    } catch (error) {
      console.error("Error enrolling in course:", error);
      alert("报名课程时发生错误");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEnrolled) {
    return (
      <Button className="w-full" variant="outline">
        已报名
      </Button>
    );
  }

  return (
    <Button
      onClick={handleEnroll}
      className="w-full"
      isLoading={isLoading}
    >
      立即报名
    </Button>
  );
}
