"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CoursesHeader() {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">我的课程</h1>
      <Button 
        onClick={() => router.push("/courses/create")}
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        创建新课程
      </Button>
    </div>
  );
}
