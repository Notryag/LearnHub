"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { VideoUpload } from "@/components/courses/video-upload";

const sectionSchema = z.object({
  title: z.string().min(1, "请输入章节标题"),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
});

type FormData = z.infer<typeof sectionSchema>;

interface SectionFormProps {
  courseId: string;
  initialData?: {
    id: string;
    title: string;
    content?: string | null;
    videoUrl?: string | null;
  };
}

export function SectionForm({ courseId, initialData }: SectionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      content: initialData.content || "",
      videoUrl: initialData.videoUrl || "",
    } : undefined,
  });

  const videoUrl = watch("videoUrl");

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const url = initialData
        ? `/api/courses/${courseId}/sections/${initialData.id}`
        : `/api/courses/${courseId}/sections`;

      const response = await fetch(url, {
        method: initialData ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(initialData ? "更新章节失败" : "创建章节失败");
      }

      router.push(`/courses/${courseId}`);
      router.refresh();
    } catch (error) {
      console.error("Error saving section:", error);
      // 这里可以添加错误提示
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = (url: string) => {
    setValue("videoUrl", url);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          章节标题
        </label>
        <input
          {...register("title")}
          id="title"
          type="text"
          className="w-full rounded-md border p-2"
          placeholder="输入章节标题"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          章节内容
        </label>
        <textarea
          {...register("content")}
          id="content"
          rows={4}
          className="w-full rounded-md border p-2"
          placeholder="输入章节内容（可选）"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">视频</label>
        <VideoUpload onUploadComplete={handleUploadComplete} />
        <input
          type="hidden"
          {...register("videoUrl")}
        />
        {videoUrl && (
          <div className="mt-2">
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: "200px" }}
            >
              您的浏览器不支持 HTML5 视频播放。
            </video>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          onClick={() => router.back()}
          className="w-full"
          variant="outline"
        >
          取消
        </Button>
        <Button type="submit" className="w-full" isLoading={isLoading}>
          {initialData ? "更新章节" : "创建章节"}
        </Button>
      </div>
    </form>
  );
}
