import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const assignmentSchema = z.object({
  title: z.string().min(3, "标题至少3个字符"),
  description: z.string().optional(),
  instructions: z.string().min(10, "作业说明至少10个字符"),
  dueDate: z.string().datetime(),
  maxScore: z.number().min(0).max(100).optional().default(100),
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

    // 检查是否是课程讲师
    const course = await prisma.course.findUnique({
      where: { 
        id: params.courseId,
        instructorId: session.user.id 
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: "Only course instructors can create assignments" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = assignmentSchema.parse(body);

    // 创建作业
    const assignment = await prisma.assignment.create({
      data: {
        courseId: params.courseId,
        ...validatedData,
        status: "PUBLISHED", // 直接发布
      },
      include: {
        course: {
          select: {
            title: true,
          }
        }
      }
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Assignment creation error:", error);
    return NextResponse.json(
      { error: "Error creating assignment" },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    // 检查用户是否是课程讲师或已报名学生
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        OR: [
          { 
            userId: session.user.id,
            courseId: params.courseId 
          },
          {
            course: {
              instructorId: session.user.id
            }
          }
        ]
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // 获取作业列表
    const assignments = await prisma.assignment.findMany({
      where: { 
        courseId: params.courseId,
        status: {
          not: "DRAFT"  // 排除草稿状态
        }
      },
      include: {
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: {
        dueDate: "desc"
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalAssignments = await prisma.assignment.count({
      where: { 
        courseId: params.courseId,
        status: {
          not: "DRAFT"
        }
      }
    });

    return NextResponse.json({
      assignments,
      pagination: {
        page,
        pageSize,
        total: totalAssignments,
        totalPages: Math.ceil(totalAssignments / pageSize)
      }
    });
  } catch (error) {
    console.error("Assignments fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching assignments" },
      { status: 500 }
    );
  }
}
