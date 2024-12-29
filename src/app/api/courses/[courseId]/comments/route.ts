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

    // 检查用户是否已报名该课程
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: params.courseId,
      },
    });

    // 如果不是课程讲师，需要先报名
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      select: { instructorId: true },
    });

    if (!enrollment && course?.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: "You must be enrolled or the course instructor to comment" },
        { status: 403 }
      );
    }

    const { content, parentId } = await req.json();

    // 验证内容
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content cannot be empty" },
        { status: 400 }
      );
    }

    // 如果是回复，检查父评论是否存在且属于同一课程
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { courseId: true },
      });

      if (!parentComment || parentComment.courseId !== params.courseId) {
        return NextResponse.json(
          { error: "Invalid parent comment" },
          { status: 400 }
        );
      }
    }

    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        courseId: params.courseId,
        parentId: parentId || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Error creating comment" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    // 获取顶级评论（不包含回复）
    const comments = await prisma.comment.findMany({
      where: {
        courseId: params.courseId,
        parentId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 获取总评论数
    const totalComments = await prisma.comment.count({
      where: {
        courseId: params.courseId,
        parentId: null,
      },
    });

    return NextResponse.json({
      comments,
      pagination: {
        page,
        pageSize,
        total: totalComments,
        totalPages: Math.ceil(totalComments / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Error fetching comments" },
      { status: 500 }
    );
  }
}
