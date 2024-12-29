"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { formatDistance } from "date-fns";
import { zhCN } from "date-fns/locale";

interface AssignmentDetailProps {
  assignment: {
    id: string;
    title: string;
    description: string;
    instructions: string;
    dueDate: string;
    maxScore: number;
    course: {
      id: string;
      title: string;
    };
  };
  isSubmitted: boolean;
  userSubmission?: {
    id: string;
    content?: string;
    fileUrl?: string;
    status: string;
    grade?: number;
    feedback?: string;
  } | null;
}

export function AssignmentDetail({ 
  assignment, 
  isSubmitted,
  userSubmission 
}: AssignmentDetailProps) {
  const router = useRouter();
  const [content, setContent] = useState(userSubmission?.content || "");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitted) {
      toast({
        title: "提交失败",
        description: "你已经提交过作业了",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim() && !file) {
      toast({
        title: "提交失败",
        description: "请提供文本内容或上传文件",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      if (content) formData.append("content", content);
      if (file) formData.append("file", file);

      const response = await fetch(`/api/assignments/${assignment.id}/submissions`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "提交失败");
      }

      toast({
        title: "提交成功",
        description: "作业已成功提交",
        variant: "default"
      });

      router.refresh();
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "提交失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [assignment.id, content, file, isSubmitted, router]);

  const renderDueDateStatus = () => {
    const now = new Date();
    const due = new Date(assignment.dueDate);
    
    if (now > due) {
      return (
        <Badge variant="destructive">
          已截止
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary">
        还剩 {formatDistance(due, now, { locale: zhCN })}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <FileText className="w-6 h-6 mr-2 text-muted-foreground" />
              {assignment.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              课程：{assignment.course.title}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {renderDueDateStatus()}
            <span className="text-sm text-muted-foreground">
              满分 {assignment.maxScore} 分
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">作业描述</h3>
            <p className="text-muted-foreground">{assignment.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">作业要求</h3>
            <p className="text-muted-foreground">{assignment.instructions}</p>
          </div>
        </div>
      </div>

      {!isSubmitted && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-muted-foreground" />
            提交作业
          </h2>

          <div className="space-y-4">
            <Textarea
              placeholder="在这里输入你的作业内容（可选）"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px]"
              disabled={isSubmitting}
            />

            <div className="flex items-center space-x-4">
              <Input
                type="file"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              {file && (
                <Badge variant="secondary">
                  {file.name}
                </Badge>
              )}
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "正在提交..." : "提交作业"}
            </Button>
          </div>
        </div>
      )}

      {isSubmitted && userSubmission && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            提交记录
          </h2>

          <div className="space-y-4">
            {userSubmission.content && (
              <div>
                <h3 className="text-lg font-semibold mb-2">提交内容</h3>
                <p className="text-muted-foreground">{userSubmission.content}</p>
              </div>
            )}

            {userSubmission.fileUrl && (
              <div>
                <h3 className="text-lg font-semibold mb-2">提交文件</h3>
                <a 
                  href={userSubmission.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  查看提交的文件
                </a>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <Badge 
                  variant={
                    userSubmission.status === "LATE" 
                      ? "destructive" 
                      : "default"
                  }
                >
                  {userSubmission.status === "LATE" 
                    ? "迟交" 
                    : "已提交"}
                </Badge>
              </div>

              {userSubmission.grade !== null && (
                <div className="text-sm">
                  成绩：
                  <span className="font-bold">
                    {userSubmission.grade} / {assignment.maxScore}
                  </span>
                </div>
              )}
            </div>

            {userSubmission.feedback && (
              <div>
                <h3 className="text-lg font-semibold mb-2">教师反馈</h3>
                <p className="text-muted-foreground">{userSubmission.feedback}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
