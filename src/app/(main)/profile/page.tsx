import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  GraduationCap, 
  Settings, 
  LogOut 
} from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const userStats = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      _count: {
        select: {
          enrollments: true,
          courses: true,
          assignments: true,
        }
      }
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage 
              src={session.user.image || "/default-avatar.png"} 
              alt={session.user.name || "用户头像"} 
            />
            <AvatarFallback>
              {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{session.user.name || "用户"}</h1>
            <p className="text-muted-foreground">{session.user.email}</p>
            <p className="text-sm text-muted-foreground">
              角色：{session.user.role === "INSTRUCTOR" ? "讲师" : "学生"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <Link href="/courses" className="w-full">
            <Button variant="outline" className="w-full flex items-center justify-start gap-2">
              <BookOpen className="w-4 h-4" />
              我的课程
              <span className="ml-auto text-xs text-muted-foreground">
                {userStats?._count.courses || 0}
              </span>
            </Button>
          </Link>

          <Link href="/learn" className="w-full">
            <Button variant="outline" className="w-full flex items-center justify-start gap-2">
              <GraduationCap className="w-4 h-4" />
              已选课程
              <span className="ml-auto text-xs text-muted-foreground">
                {userStats?._count.enrollments || 0}
              </span>
            </Button>
          </Link>

          <Link href="/settings" className="w-full">
            <Button variant="outline" className="w-full flex items-center justify-start gap-2">
              <Settings className="w-4 h-4" />
              账户设置
            </Button>
          </Link>

          <Button 
            variant="destructive" 
            className="w-full flex items-center justify-start gap-2"
            // 添加退出登录逻辑
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
}
