import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
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

    // 获取课程的所有章节
    const sections = await prisma.section.findMany({
      where: {
        courseId: params.courseId,
      },
      select: {
        id: true,
        title: true,
        progress: {
          where: {
            userId: session.user.id,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    // 计算总进度
    const totalSections = sections.length;
    const completedSections = sections.filter(
      section => section.progress[0]?.completed
    ).length;

    const progress = {
      totalSections,
      completedSections,
      percentage: totalSections > 0
        ? Math.round((completedSections / totalSections) * 100)
        : 0,
      sections: sections.map(section => ({
        id: section.id,
        title: section.title,
        completed: section.progress[0]?.completed || false,
        watchTime: section.progress[0]?.watchTime || 0,
        lastWatch: section.progress[0]?.lastWatch || null,
      })),
    };

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error fetching course progress:", error);
    return NextResponse.json(
      { error: "Error fetching course progress" },
      { status: 500 }
    );
  }
}
