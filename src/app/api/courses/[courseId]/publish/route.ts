import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// 发布课程验证模式
const publishSchema = z.object({
  courseId: z.string().min(1, "课程ID不能为空"),
  sections: z.number().min(1, "至少需要一个章节"),
  price: z.number().min(0, "价格不能为负").optional(),
  published: z.boolean().optional().default(true)
});

export async function POST(
  req: Request, 
  context: { params: { courseId: string } }
) {
  const { params } = context;
  
  try {
    console.log("Publishing course:", params, params.courseId);
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    // 检查课程是否属于当前讲师
    const course = await prisma.course.findUnique({
      where: { 
        id: params.courseId,
        instructorId: session.user.id 
      },
      include: {
        sections: {
          select: { id: true }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: "课程不存在或无权限" },
        { status: 404 }
      );
    }

    const body = await req.json();
    console.log("Request Body:", body);

    const validatedData = publishSchema.parse({
      courseId: params.courseId,
      sections: course.sections.length,
      price: body.price !== undefined 
        ? (typeof body.price === 'string' 
            ? parseFloat(body.price) 
            : Number(body.price)) 
        : course.price,
      published: true
    });

    // 更新课程为已发布
    const publishedCourse = await prisma.course.update({
      where: { id: params.courseId },
      data: {
        published: true,
        price: validatedData.price || course.price,
        publishedAt: new Date()
      }
    });

    return NextResponse.json(publishedCourse, { status: 200 });
  } catch (error) {
    console.error("发布课程错误:", error.message);

    // 处理 null 或 undefined 情况
    if (error === null || error === undefined) {
      return NextResponse.json(
        { error: "未知错误" },
        { status: 500 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "验证失败", 
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: "发布课程失败", 
          message: error.message 
        },
        { status: 500 }
      );
    }

    // 兜底处理
    return NextResponse.json(
      { error: "系统错误", details: String(error) },
      { status: 500 }
    );
  }
}

// 获取课程发布状态
export async function GET(
  req: Request, 
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { 
        id: params.courseId 
      },
      select: {
        id: true,
        title: true,
        published: true,
        sections: {
          select: { id: true }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: "课程不存在" },
        { status: 404 }
      );
    }

    // 检查发布条件
    const canPublish = course.sections.length > 0;

    return NextResponse.json({
      courseId: course.id,
      title: course.title,
      published: course.published,
      canPublish,
      requiredSections: 1,
      currentSections: course.sections.length
    });
  } catch (error) {
    console.error("获取课程发布状态错误:", error);
    return NextResponse.json(
      { error: "获取课程状态失败" },
      { status: 500 }
    );
  }
}
