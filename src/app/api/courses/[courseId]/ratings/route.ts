import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { profanityFilter } from "@/lib/utils/profanity-filter";

const ratingSchema = z.object({
  contentRating: z.number().int().min(1).max(5),
  teacherRating: z.number().int().min(1).max(5),
  experienceRating: z.number().int().min(1).max(5),
  knowledgeRating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  anonymous: z.boolean().optional().default(false),
});

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

    // 检查用户是否已完成课程
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: params.courseId,
      },
      include: {
        course: {
          select: {
            sections: {
              select: {
                progress: {
                  where: {
                    userId: session.user.id,
                    completed: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You must be enrolled in the course to rate it" },
        { status: 403 }
      );
    }

    // 检查是否已完成所有章节
    const totalSections = enrollment.course.sections.length;
    const completedSections = enrollment.course.sections.filter(
      section => section.progress.length > 0
    ).length;

    if (completedSections < totalSections) {
      return NextResponse.json(
        { error: "You must complete the entire course before rating" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = ratingSchema.parse(body);

    // 敏感词过滤
    if (validatedData.comment) {
      const filteredComment = profanityFilter(validatedData.comment);
      if (filteredComment !== validatedData.comment) {
        return NextResponse.json(
          { error: "评论内容包含敏感词" },
          { status: 400 }
        );
      }
    }

    // 检查是否已经评价过
    const existingRating = await prisma.courseRating.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: params.courseId,
        },
      },
    });

    let rating;
    if (existingRating) {
      // 更新已存在的评分
      rating = await prisma.courseRating.update({
        where: {
          id: existingRating.id,
        },
        data: {
          ...validatedData,
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
    } else {
      // 创建新评分
      rating = await prisma.courseRating.create({
        data: {
          userId: session.user.id,
          courseId: params.courseId,
          ...validatedData,
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
    }

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating rating:", error);
    return NextResponse.json(
      { error: "Error creating/updating rating" },
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

    // 获取课程的所有评分
    const ratings = await prisma.courseRating.findMany({
      where: {
        courseId: params.courseId,
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
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 获取课程的总评分统计
    const ratingStats = await prisma.courseRating.aggregate({
      where: {
        courseId: params.courseId,
      },
      _avg: {
        contentRating: true,
        teacherRating: true,
        experienceRating: true,
        knowledgeRating: true,
      },
      _count: {
        id: true,
      },
    });

    // 获取总评分数
    const totalRatings = await prisma.courseRating.count({
      where: {
        courseId: params.courseId,
      },
    });

    return NextResponse.json({
      ratings,
      stats: {
        averageRatings: {
          content: ratingStats._avg.contentRating || 0,
          teacher: ratingStats._avg.teacherRating || 0,
          experience: ratingStats._avg.experienceRating || 0,
          knowledge: ratingStats._avg.knowledgeRating || 0,
        },
        totalRatings: ratingStats._count.id,
        totalPages: Math.ceil(totalRatings / pageSize),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Error fetching ratings" },
      { status: 500 }
    );
  }
}
