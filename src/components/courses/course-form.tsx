"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";

const courseSchema = z.object({
  title: z.string().min(1, "请输入课程标题"),
  description: z.string().min(1, "请输入课程描述"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "请输入有效的价格",
  }),
});

type FormData = z.infer<typeof courseSchema>;

export function CourseForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(courseSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
        }),
      });

      if (!response.ok) {
        throw new Error("创建课程失败");
      }

      const course = await response.json();
      router.push(`/courses/${course.id}`);
    } catch (error) {
      console.error("Error creating course:", error);
      // 这里可以添加错误提示
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          课程标题
        </label>
        <input
          {...register("title")}
          id="title"
          type="text"
          className="w-full rounded-md border p-2"
          placeholder="输入课程标题"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          课程描述
        </label>
        <textarea
          {...register("description")}
          id="description"
          rows={4}
          className="w-full rounded-md border p-2"
          placeholder="输入课程描述"
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="price" className="text-sm font-medium">
          课程价格
        </label>
        <div className="relative">
          <span className="absolute left-2 top-2">¥</span>
          <input
            {...register("price")}
            id="price"
            type="number"
            step="0.01"
            min="0"
            className="w-full rounded-md border p-2 pl-6"
            placeholder="0.00"
          />
        </div>
        {errors.price && (
          <p className="text-sm text-red-500">{errors.price.message}</p>
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
          创建课程
        </Button>
      </div>
    </form>
  );
}
