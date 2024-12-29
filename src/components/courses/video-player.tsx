"use client";

import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  url: string;
  courseId: string;
  sectionId: string;
}

interface Progress {
  completed: boolean;
  watchTime: number;
}

export function VideoPlayer({ url, courseId, sectionId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState<Progress>({
    completed: false,
    watchTime: 0,
  });
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout>();

  // 加载进度
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await fetch(
          `/api/courses/${courseId}/sections/${sectionId}/progress`
        );
        if (response.ok) {
          const data = await response.json();
          setProgress(data);
          
          // 设置视频播放位置
          if (videoRef.current && data.watchTime > 0) {
            videoRef.current.currentTime = data.watchTime;
          }
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    };

    loadProgress();
  }, [courseId, sectionId]);

  // 更新进度
  const updateProgress = async (completed: boolean, watchTime: number) => {
    try {
      await fetch(
        `/api/courses/${courseId}/sections/${sectionId}/progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completed, watchTime }),
        }
      );
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  // 处理视频播放进度
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentTime = Math.floor(videoRef.current.currentTime);
    const duration = Math.floor(videoRef.current.duration);
    const completed = currentTime >= duration - 5; // 视为完成的阈值：距离结束不到5秒

    // 清除之前的定时器
    if (progressUpdateTimeoutRef.current) {
      clearTimeout(progressUpdateTimeoutRef.current);
    }

    // 设置新的定时器，延迟更新进度
    progressUpdateTimeoutRef.current = setTimeout(() => {
      if (
        currentTime !== progress.watchTime ||
        completed !== progress.completed
      ) {
        setProgress({ completed, watchTime: currentTime });
        updateProgress(completed, currentTime);
      }
    }, 1000);
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        controls
        src={url}
        onTimeUpdate={handleTimeUpdate}
      >
        您的浏览器不支持 HTML5 视频播放。
      </video>
    </div>
  );
}
