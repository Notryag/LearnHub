import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CourseRecommender } from "@/lib/utils/course-recommender";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    if (!session) {
      // 如果未登录，返回热门课程
      const popularCourses = await CourseRecommender.getPopularCourses(limit);
      return NextResponse.json({
        type: "popular",
        recommendations: popularCourses
      });
    }

    // 个性化推荐
    const recommendations = await CourseRecommender.recommendForUser(
      session.user.id, 
      limit
    );
    return NextResponse.json({
      type: recommendations.length > 0 ? "personalized" : "popular",
      recommendations: recommendations.length > 0 
        ? recommendations 
        : await CourseRecommender.getPopularCourses(limit)
    });
  } catch (error) {
    console.error("Recommendation error:", error.message);
    return NextResponse.json(
      { error: "Error generating recommendations" },
      { status: 500 }
    );
  }
}
