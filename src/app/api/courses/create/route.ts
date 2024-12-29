import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "未授权" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);

    if (!title || !description || isNaN(price)) {
      return NextResponse.json({ error: "参数无效" }, { status: 400 });
    }

    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        price,
        instructorId: session.user.id,
        published: false
      }
    });

    // 重定向到课程编辑页面
    return NextResponse.redirect(
      new URL(`/courses/${newCourse.id}/edit`, request.url), 
      { status: 302 }
    );
  } catch (error) {
    console.error("创建课程错误:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
