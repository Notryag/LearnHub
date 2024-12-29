import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, description, price } = await req.json();

    // 验证输入
    if (!title) {
      return NextResponse.json(
        { error: "课程标题不能为空" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: price || 0,
        instructorId: session.user.id,
        published: false, // 默认未发布
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "创建课程失败" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const published = searchParams.get("published");
    const instructorId = searchParams.get("instructorId");

    const courses = await prisma.course.findMany({
      where: {
        published: published === "true" ? true : undefined,
        instructorId: instructorId || undefined,
      },
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            sections: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Error fetching courses" },
      { status: 500 }
    );
  }
}
