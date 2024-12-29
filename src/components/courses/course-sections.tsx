"use client";

import Link from "next/link";
import { Section } from "@prisma/client";

interface CourseSectionsProps {
  sections: Section[];
  courseId: string;
  isInstructor: boolean;
  isEnrolled: boolean;
}

export function CourseSections({
  sections,
  courseId,
  isInstructor,
  isEnrolled,
}: CourseSectionsProps) {
  if (sections.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">暂无课程内容</p>
        {isInstructor && (
          <Link
            href={`/courses/${courseId}/sections/create`}
            className="text-primary hover:underline mt-2 inline-block"
          >
            添加章节
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div
          key={section.id}
          className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{section.title}</h3>
              {section.content && (
                <p className="text-sm text-muted-foreground mt-1">
                  {section.content}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {section.videoUrl && (isEnrolled || isInstructor) ? (
                <Link
                  href={`/courses/${courseId}/sections/${section.id}`}
                  className="text-primary hover:underline text-sm"
                >
                  观看视频
                </Link>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {section.videoUrl ? "需要报名" : "暂无视频"}
                </span>
              )}
              {isInstructor && (
                <Link
                  href={`/courses/${courseId}/sections/${section.id}/edit`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  编辑
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
      {isInstructor && (
        <Link
          href={`/courses/${courseId}/sections/create`}
          className="block text-center py-4 border rounded-lg text-primary hover:underline"
        >
          添加章节
        </Link>
      )}
    </div>
  );
}
