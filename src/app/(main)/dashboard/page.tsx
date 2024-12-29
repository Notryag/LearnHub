import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  GraduationCap, 
  CheckCircle 
} from "lucide-react";
import { CourseRecommendations } from "@/components/recommendations/course-recommendations";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  // 获取用户统计信息
  const userStats = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      _count: {
        select: {
          enrollments: true,
          courses: true,
          assignments: true,
          ratings: true,
          comments: true
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        欢迎回来, {session.user.name || "学习者"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已选课程</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?._count.enrollments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              正在学习的课程数量
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">创建的课程</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?._count.courses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              您创建的课程总数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">作业提交</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?._count.assignments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              已完成的作业数量
            </p>
          </CardContent>
        </Card>
      </div>

      <CourseRecommendations />
    </div>
  );
}
