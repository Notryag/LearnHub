import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    const section = await prisma.section.findUnique({
      where: {
        id: params.sectionId,
        courseId: params.courseId,
      },
      include: {
        course: {
          select: {
            instructorId: true,
            enrollments: {
              where: {
                userId: session.user.id,
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    // 检查访问权限
    const isInstructor = section.course.instructorId === session.user.id;
    const isEnrolled = section.course.enrollments.length > 0;

    if (!isInstructor && !isEnrolled) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error("Error fetching section:", error);
    return NextResponse.json(
      { error: "Error fetching section" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const section = await prisma.section.findUnique({
      where: {
        id: params.sectionId,
        courseId: params.courseId,
      },
      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    if (section.course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { title, content, videoUrl, order } = await req.json();

    const updatedSection = await prisma.section.update({
      where: {
        id: params.sectionId,
      },
      data: {
        title,
        content,
        videoUrl,
        order,
      },
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      { error: "Error updating section" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const section = await prisma.section.findUnique({
      where: {
        id: params.sectionId,
        courseId: params.courseId,
      },
      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    if (section.course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.section.delete({
      where: {
        id: params.sectionId,
      },
    });

    // 重新排序剩余章节
    const remainingSections = await prisma.section.findMany({
      where: {
        courseId: params.courseId,
        order: {
          gt: section.order,
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    for (const [index, section] of remainingSections.entries()) {
      await prisma.section.update({
        where: { id: section.id },
        data: { order: section.order - 1 },
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      { error: "Error deleting section" },
      { status: 500 }
    );
  }
}
