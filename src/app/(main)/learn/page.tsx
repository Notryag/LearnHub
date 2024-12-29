import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/courses/course-card";

export default async function LearnPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // 获取用户已选课程
  const enrollments = await prisma.enrollment.findMany({
    where: { 
      userId: session.user.id 
    },
    include: {
      course: {
        include: {
          instructor: {
            select: { 
              name: true 
            }
          },
          _count: {
            select: { 
              sections: true 
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">我的学习</h1>
        <p className="text-muted-foreground mt-2">
          您已报名的课程
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <p>您还没有报名任何课程</p>
          <p className="mt-2 text-sm">
            浏览 <a href="/courses" className="text-primary hover:underline">课程列表</a> 开始您的学习之旅
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <CourseCard 
              key={enrollment.course.id} 
              course={enrollment.course}
              sectionCount={enrollment.course._count.sections}
            />
          ))}
        </div>
      )}
    </div>
  );
}
