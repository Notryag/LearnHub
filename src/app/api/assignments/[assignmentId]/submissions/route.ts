import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { uploadFile } from "@/lib/utils/file-upload";

const submissionSchema = z.object({
  content: z.string().optional(),
  fileUrl: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 检查作业是否存在且可提交
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.assignmentId },
      include: {
        course: {
          select: {
            id: true,
            instructorId: true,
          }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // 检查是否已超过截止日期
    if (new Date(assignment.dueDate) < new Date()) {
      return NextResponse.json(
        { error: "Assignment submission deadline has passed" },
        { status: 403 }
      );
    }

    // 检查用户是否已报名课程
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: assignment.course.id
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You must be enrolled in the course" },
        { status: 403 }
      );
    }

    // 检查是否已提交
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_userId: {
          assignmentId: params.assignmentId,
          userId: session.user.id
        }
      }
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already submitted this assignment" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const content = formData.get('content') as string | null;

    // 验证提交内容
    if (!file && (!content || content.trim() === '')) {
      return NextResponse.json(
        { error: "Please provide either a file or text content" },
        { status: 400 }
      );
    }

    let fileUrl = null;
    if (file) {
      // 上传文件
      fileUrl = await uploadFile(file, `assignments/${params.assignmentId}`);
    }

    // 创建提交
    const submission = await prisma.submission.create({
      data: {
        assignmentId: params.assignmentId,
        userId: session.user.id,
        content: content || undefined,
        fileUrl: fileUrl || undefined,
        status: new Date(assignment.dueDate) < new Date() 
          ? "LATE" 
          : "SUBMITTED"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Error submitting assignment" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { assignmentId: string } }
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

    // 检查用户是否是课程讲师
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.assignmentId },
      include: {
        course: {
          select: {
            instructorId: true
          }
        }
      }
    });

    if (!assignment || 
        (assignment.course.instructorId !== session.user.id && 
         session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // 获取提交列表
    const submissions = await prisma.submission.findMany({
      where: { 
        assignmentId: params.assignmentId 
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        submittedAt: "desc"
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalSubmissions = await prisma.submission.count({
      where: { assignmentId: params.assignmentId }
    });

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        pageSize,
        total: totalSubmissions,
        totalPages: Math.ceil(totalSubmissions / pageSize)
      }
    });
  } catch (error) {
    console.error("Submissions fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching submissions" },
      { status: 500 }
    );
  }
}
