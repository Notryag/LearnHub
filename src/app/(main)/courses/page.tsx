import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CoursesHeader } from "@/components/courses/courses-header";
import { CourseCard } from "@/components/courses/course-card";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const isInstructor = session.user.role === "INSTRUCTOR";

  const courses = await prisma.course.findMany({
    where: isInstructor 
      ? { instructorId: session.user.id } 
      : { published: true },
    include: {
      instructor: true,
      _count: {
        select: { sections: true }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <CoursesHeader />
      
      {courses.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          {isInstructor 
            ? "您还没有创建任何课程" 
            : "暂无可用课程"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course}
              sectionCount={course._count.sections}
            />
          ))}
        </div>
      )}
    </div>
  );
}
