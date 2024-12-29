import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      select: { published: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    if (!course.published) {
      return NextResponse.json(
        { error: "Course is not published" },
        { status: 400 }
      );
    }

    // 检查是否已经报名
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: params.courseId,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled" },
        { status: 400 }
      );
    }

    // 创建报名记录
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: params.courseId,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: "Error enrolling in course" },
      { status: 500 }
    );
  }
}
