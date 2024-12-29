"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface VideoUploadProps {
  onUploadComplete: (url: string) => void;
}

export function VideoUpload({ onUploadComplete }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith("video/")) {
      alert("请选择视频文件");
      return;
    }

    // 检查文件大小（100MB）
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("文件大小不能超过100MB");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("上传失败");
      }

      const data = await response.json();
      onUploadComplete(data.url);

      // 清除文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("上传视频时发生错误");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        variant="outline"
        className="w-full"
      >
        {isUploading ? "上传中..." : "选择视频文件"}
      </Button>
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        支持的格式：MP4、WebM等主流视频格式
        <br />
        最大文件大小：100MB
      </p>
    </div>
  );
}
