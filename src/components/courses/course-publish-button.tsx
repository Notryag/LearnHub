"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Send } from "lucide-react";

interface CoursePublishButtonProps {
  courseId: string;
  initialPrice: number;
  disabled?: boolean;
  onPublishSuccess?: (courseId: string) => void; 
}

export function CoursePublishButton({ 
  courseId, 
  initialPrice,
  disabled,
  onPublishSuccess 
}: CoursePublishButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [price, setPrice] = useState(initialPrice);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{
    canPublish: boolean;
    currentSections: number;
    requiredSections: number;
  } | null>(null);

  const router = useRouter();

  const checkPublishStatus = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/publish`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setPublishStatus(data);
      setIsOpen(true);
    } catch (error) {
      toast({
        title: "获取课程状态失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const response = await fetch(`/api/courses/${courseId}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ price })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "课程发布成功",
        description: "您的课程现已公开发布",
        variant: "default"
      });

      onPublishSuccess?.(courseId);

      router.push(`/courses/${courseId}`);
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "发布课程失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <Button 
        onClick={checkPublishStatus}
        disabled={disabled}
        variant="outline"
      >
        <Send className="w-4 h-4 mr-2" />
        发布课程
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>发布课程</DialogTitle>
            <DialogDescription>
              确认发布您的课程并设置价格
            </DialogDescription>
          </DialogHeader>

          {publishStatus && (
            <div>
              {publishStatus.currentSections < publishStatus.requiredSections ? (
                <div className="text-destructive mb-4">
                  课程至少需要 {publishStatus.requiredSections} 个章节，
                  当前仅有 {publishStatus.currentSections} 个章节
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>课程价格</Label>
                    <Input 
                      type="number" 
                      value={price} 
                      onChange={(e) => setPrice(Number(e.target.value))}
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isPublishing}
            >
              取消
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={
                isPublishing || 
                !publishStatus?.canPublish
              }
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  发布中...
                </>
              ) : (
                "确认发布"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
