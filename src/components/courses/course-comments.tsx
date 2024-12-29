"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface Comment {
  id: string;
  content: string;
  user: User;
  createdAt: string;
  replies: Comment[];
  _count?: {
    replies: number;
  };
}

interface CommentProps {
  courseId: string;
}

export function CourseComments({ courseId }: CommentProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pageSize: 10
  });

  const fetchComments = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/courses/${courseId}/comments?page=${page}&limit=${pagination.pageSize}`);
      const data = await response.json();

      setPagination(prev => ({
        ...prev,
        page,
        total: data.total || 0
      }));

      if (page === 1) {
        setComments(data.comments || []);
      } else {
        setComments(prev => [...prev, ...(data.comments || [])]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [courseId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/courses/${courseId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          parentId: replyTo,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        
        // 如果是回复
        if (replyTo) {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === replyTo
                ? {
                    ...comment,
                    replies: [...(comment.replies || []), newCommentData],
                  }
                : comment
            )
          );
        } else {
          // 如果是新的顶级评论
          setComments((prev) => [newCommentData, ...prev]);
        }

        setNewComment("");
        setReplyTo(null);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchComments(pagination.page + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">
          课程讨论 ({pagination.total})
        </h2>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex space-x-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              replyTo
                ? "回复这条评论..."
                : "分享你对课程的想法..."
            }
            className="w-full rounded-md border p-2 min-h-[100px]"
          />
        </div>
        <div className="flex justify-between items-center">
          {replyTo && (
            <div className="text-sm text-muted-foreground">
              正在回复评论
              <button
                onClick={() => setReplyTo(null)}
                className="ml-2 text-red-500 hover:underline"
              >
                取消
              </button>
            </div>
          )}
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isLoading}
            className="ml-auto"
          >
            <Send className="w-4 h-4 mr-2" />
            发送
          </Button>
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          还没有人发表评论，快来抢沙发吧！
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={(commentId) => setReplyTo(commentId)}
            />
          ))}

          {pagination.page < pagination.totalPages && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                加载更多
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string) => void;
}

function CommentItem({ comment, onReply }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <Image
          src={comment.user.image || "/default-avatar.png"}
          alt={comment.user.name || "用户"}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="font-medium text-sm">
                {comment.user.name || "匿名用户"}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => onReply(comment.id)}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              回复
            </button>
          </div>
          <p className="text-sm">{comment.content}</p>

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                {showReplies ? "收起回复" : `查看 ${comment.replies.length} 条回复`}
              </button>

              {showReplies && (
                <div className="space-y-2 mt-2 pl-4 border-l">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-2">
                      <Image
                        src={reply.user.image || "/default-avatar.png"}
                        alt={reply.user.name || "用户"}
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                      <div>
                        <div>
                          <span className="font-medium text-xs">
                            {reply.user.name || "匿名用户"}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
