"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface CourseProgressProps {
  courseId: string;
}

interface Progress {
  totalSections: number;
  completedSections: number;
  percentage: number;
  sections: {
    id: string;
    title: string;
    completed: boolean;
    watchTime: number;
    lastWatch: string | null;
  }[];
}

export function CourseProgress({ courseId }: CourseProgressProps) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await fetch(
          `/api/courses/${courseId}/progress`
        );
        if (response.ok) {
          const data = await response.json();
          setProgress(data);
        }
      } catch (error) {
        console.error("Error loading course progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">课程进度</h3>
          <span className="text-sm text-muted-foreground">
            {progress.percentage}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-primary rounded-full transition-all"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          已完成 {progress.completedSections} / {progress.totalSections} 章节
        </p>
      </div>

      <div className="space-y-2">
        {progress.sections.map((section) => (
          <div
            key={section.id}
            className="flex items-center gap-2 text-sm"
          >
            {section.completed ? (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={section.completed ? "text-primary" : ""}>
              {section.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
