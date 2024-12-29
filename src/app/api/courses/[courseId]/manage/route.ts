import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest, 
  { params }: { params: { courseId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  try {
    const { courseId } = params;
    const data = await request.json();

    // 验证课程是否属于当前讲师
    const existingCourse = await prisma.course.findUnique({
      where: { 
        id: courseId,
        instructorId: session.user.id 
      }
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 });
    }

    // 更新课程信息
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        published: data.published,
        coverImage: data.coverImage
      }
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    console.error("更新课程错误:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: { courseId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  try {
    const { courseId } = params;

    // 验证课程是否属于当前讲师
    const existingCourse = await prisma.course.findUnique({
      where: { 
        id: courseId,
        instructorId: session.user.id 
      }
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 });
    }

    // 删除课程（级联删除相关记录）
    await prisma.course.delete({
      where: { id: courseId }
    });

    return NextResponse.json({ message: "课程已删除" }, { status: 200 });
  } catch (error) {
    console.error("删除课程错误:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
