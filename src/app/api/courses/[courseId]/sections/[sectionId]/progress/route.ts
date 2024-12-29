import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 检查用户是否已报名该课程
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: params.courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    const { completed, watchTime } = await req.json();

    // 更新或创建进度记录
    const progress = await prisma.progress.upsert({
      where: {
        userId_sectionId: {
          userId: session.user.id,
          sectionId: params.sectionId,
        },
      },
      update: {
        completed,
        watchTime,
        lastWatch: new Date(),
      },
      create: {
        userId: session.user.id,
        sectionId: params.sectionId,
        completed,
        watchTime,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Error updating progress" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const progress = await prisma.progress.findUnique({
      where: {
        userId_sectionId: {
          userId: session.user.id,
          sectionId: params.sectionId,
        },
      },
    });

    return NextResponse.json(progress || {
      completed: false,
      watchTime: 0,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Error fetching progress" },
      { status: 500 }
    );
  }
}
