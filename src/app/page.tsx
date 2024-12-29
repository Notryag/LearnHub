import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { CourseRecommendations } from "@/components/recommendations/course-recommendations";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          {session 
            ? `欢迎回来，${session.user.name || '学习者'}` 
            : '开启你的学习之旅'}
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          {session 
            ? '继续你的学习，探索更多课程' 
            : '发现最适合你的在线课程'}
        </p>
        
        {!session && (
          <div className="flex justify-center space-x-4">
            <Link 
              href="/auth/login" 
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              立即登录
            </Link>
            <Link 
              href="/auth/register" 
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              免费注册
            </Link>
          </div>
        )}
      </div>

      {session && (
        <div className="mb-12">
          <CourseRecommendations />
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">丰富的课程</h2>
          <p className="text-muted-foreground">
            涵盖多个领域，从编程到设计，满足不同学习需求
          </p>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">互动学习</h2>
          <p className="text-muted-foreground">
            在线讨论、实时互动，与讲师和同学一起成长
          </p>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">灵活学习</h2>
          <p className="text-muted-foreground">
            随时随地学习，进度自由，轻松管理学习时间
          </p>
        </div>
      </div>
    </div>
  );
}
