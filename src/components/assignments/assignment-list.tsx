"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  maxScore: number;
  _count: {
    submissions: number;
  };
}

interface AssignmentListProps {
  courseId: string;
  isInstructor: boolean;
}

export function AssignmentList({ courseId, isInstructor }: AssignmentListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/courses/${courseId}/assignments?page=${page}&pageSize=${pagination.pageSize}`
      );
      const data = await response.json();
      
      if (page === 1) {
        setAssignments(data.assignments);
      } else {
        setAssignments((prev) => [...prev, ...data.assignments]);
      }
      
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const handleLoadMore = () => {
    fetchAssignments(pagination.page + 1);
  };

  const renderDueDateStatus = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    
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

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {isInstructor ? (
          <>
            <p>还没有创建作业</p>
            <Button className="mt-4">创建第一个作业</Button>
          </>
        ) : (
          <p>暂无作业</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {assignments.map((assignment) => (
        <Card key={assignment.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="w-5 h-5 mr-2 text-muted-foreground" />
              {assignment.title}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {renderDueDateStatus(assignment.dueDate)}
              <span className="text-xs text-muted-foreground">
                满分 {assignment.maxScore} 分
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {assignment.description || assignment.instructions}
            </p>
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                已提交：{assignment._count.submissions} 人
              </div>
              <Link href={`/assignments/${assignment.id}`}>
                <Button size="sm" variant="outline">
                  查看详情
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
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
  );
}
