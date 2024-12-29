import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseEnrollButton } from "@/components/courses/course-enroll-button";
import { CourseComments } from "@/components/courses/course-comments";
import { VideoPlayer } from "@/components/courses/video-player";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Clock, 
  User, 
  DollarSign 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default async function CourseDetailPage({ 
  params 
}: { 
  params: { courseId: string } 
}) {
  const session = await getServerSession(authOptions);

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      instructor: {
        select: { 
          name: true, 
          image: true 
        }
      },
      sections: {
        orderBy: { order: 'asc' }
      },
      _count: {
        select: { 
          sections: true,
          enrollments: true,
          comments: true,
          ratings: true
        }
      }
    }
  });

  if (!course || (!course.published && course.instructorId !== session?.user.id)) {
    notFound();
  }

  const isEnrolled = session ? await prisma.enrollment.findFirst({
    where: {
      userId: session.user.id,
      courseId: course.id
    }
  }) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* 课程头部 */}
        <div className="md:col-span-2 space-y-6">
          {course.coverImage && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <Image 
                src={course.coverImage} 
                alt={course.title} 
                fill 
                className="object-cover" 
              />
            </div>
          )}

          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                <BookOpen className="mr-2 h-4 w-4" />
                {course._count.sections} 章节
              </Badge>
              <Badge variant="outline">
                <User className="mr-2 h-4 w-4" />
                {course._count.enrollments} 名学生
              </Badge>
              
              {session?.user.id === course.instructorId && (
                <Link 
                  href={`/courses/${course.id}/edit`} 
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "ml-auto"
                  )}
                >
                  编辑课程
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 课程信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>课程详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>价格: {course.price === 0 ? '免费' : `¥${course.price.toFixed(2)}`}</span>
            </div>

            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>讲师: {course.instructor.name}</span>
            </div>

            <CourseEnrollButton 
              courseId={course.id} 
              price={course.price}
              isEnrolled={!!isEnrolled}
            />
          </CardContent>
        </Card>

        {/* 课程章节 */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">课程章节</h2>
          {course.sections.map((section, index) => (
            <Card key={section.id} className="mb-4">
              <CardHeader>
                <CardTitle>
                  第 {index + 1} 章: {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {section.videoUrl && (
                  <VideoPlayer 
                    src={section.videoUrl} 
                    title={section.title} 
                  />
                )}
                <p className="mt-4 text-muted-foreground">
                  {section.content || '暂无详细内容'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 课程评论 */}
        <div className="md:col-span-2">
          <CourseComments courseId={course.id} />
        </div>
      </div>
    </div>
  );
}
