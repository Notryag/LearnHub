import { prisma } from "@/lib/prisma";

// 推荐算法权重配置
const WEIGHTS = {
  rating: 0.4,        // 课程评分权重
  similarity: 0.3,    // 用户相似度权重
  enrollment: 0.2,    // 报名人数权重
  recency: 0.1,       // 课程新鲜度权重
};

interface CourseRecommendation {
  courseId: string;
  score: number;
  course: {
    title: string;
    description: string;
    coverImage: string | null;
    instructor: {
      name: string;
    };
  };
}

export class CourseRecommender {
  // 基于用户协同过滤的推荐算法
  static async recommendForUser(userId: string, limit = 5): Promise<CourseRecommendation[]> {
    try {
      // 获取用户已报名和已完成的课程
      const userEnrollments = await prisma.enrollment.findMany({
        where: { userId },
        select: { courseId: true },
      });
      const enrolledCourseIds = userEnrollments.map(e => e.courseId);

      // 获取用户的评分历史
      const userRatings = await prisma.courseRating.findMany({
        where: { 
          userId,
          courseId: { notIn: enrolledCourseIds }  // 排除已报名课程
        },
        select: { 
          courseId: true, 
          contentRating: true,
          teacherRating: true,
          experienceRating: true,
          knowledgeRating: true
        },
      });

      // 计算相似用户
      const similarUsers = await this.findSimilarUsers(userId);

      // 获取推荐课程
      const recommendedCourses = await this.calculateRecommendations(
        userId, 
        userRatings, 
        similarUsers, 
        enrolledCourseIds,
        limit
      );

      return recommendedCourses;
    } catch (error) {
      console.error("Course recommendation error:", error);
      return [];
    }
  }

  // 寻找相似用户
  private static async findSimilarUsers(userId: string) {
    const userRatings = await prisma.courseRating.findMany({
      where: { userId },
      select: { 
        courseId: true, 
        contentRating: true,
        teacherRating: true,
        experienceRating: true,
        knowledgeRating: true
      },
    });

    // 计算用户相似度的余弦相似度算法
    const similarUsers = await prisma.courseRating.groupBy({
      by: ['userId'],
      where: {
        userId: { not: userId },
        courseId: { in: userRatings.map(r => r.courseId) }
      },
      _avg: {
        contentRating: true,
        teacherRating: true,
        experienceRating: true,
        knowledgeRating: true
      },
    });

    return similarUsers;
  }

  // 计算推荐课程
  private static async calculateRecommendations(
    userId: string, 
    userRatings: any[], 
    similarUsers: any[], 
    enrolledCourseIds: string[],
    limit: number
  ): Promise<CourseRecommendation[]> {
    const recommendations: { [key: string]: number } = {};

    // 1. 基于课程评分的推荐
    const courseRatings = await prisma.courseRating.groupBy({
      by: ['courseId'],
      where: { 
        courseId: { notIn: [...enrolledCourseIds] },
      },
      _avg: {
        contentRating: true,
        teacherRating: true,
        experienceRating: true,
        knowledgeRating: true
      },
      _count: {
        courseId: true
      }
    });

    // 2. 基于课程报名人数
    const courseEnrollments = await prisma.enrollment.groupBy({
      by: ['courseId'],
      where: { 
        courseId: { notIn: [...enrolledCourseIds] },
      },
      _count: {
        courseId: true
      }
    });

    // 3. 课程新鲜度
    const courses = await prisma.course.findMany({
      where: { 
        id: { notIn: [...enrolledCourseIds] },
      },
      select: {
        id: true,
        createdAt: true,
        title: true,
        description: true,
        coverImage: true,
        instructor: {
          select: { name: true }
        }
      }
    });

    // 计算推荐分数
    courses.forEach(course => {
      let score = 0;

      // 评分权重
      const ratingData = courseRatings.find(r => r.courseId === course.id);
      if (ratingData) {
        const avgRating = (
          ratingData._avg.contentRating + 
          ratingData._avg.teacherRating + 
          ratingData._avg.experienceRating + 
          ratingData._avg.knowledgeRating
        ) / 4;
        score += avgRating * WEIGHTS.rating;
      }

      // 报名人数权重
      const enrollmentData = courseEnrollments.find(e => e.courseId === course.id);
      if (enrollmentData) {
        score += Math.log(enrollmentData._count.courseId + 1) * WEIGHTS.enrollment;
      }

      // 课程新鲜度权重
      const courseAge = (Date.now() - new Date(course.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
      score += Math.max(0, (6 - courseAge) / 6) * WEIGHTS.recency;

      recommendations[course.id] = score;
    });

    // 排序并返回推荐课程
    return Object.entries(recommendations)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([courseId]) => {
        const course = courses.find(c => c.id === courseId)!;
        return {
          courseId,
          score: recommendations[courseId],
          course: {
            title: course.title,
            description: course.description,
            coverImage: course.coverImage,
            instructor: {
              name: course.instructor.name
            }
          }
        };
      });
  }

  // 获取热门课程
  static async getPopularCourses(limit = 5): Promise<CourseRecommendation[]> {
    try {
      const popularCourses = await prisma.course.findMany({
        where: { 
          published: true,
          deletedAt: null
        },
        orderBy: [
          { enrollments: { _count: 'desc' } },
          { createdAt: 'desc' }
        ],
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          coverImage: true,
          instructor: {
            select: { name: true }
          },
          _count: {
            select: { enrollments: true }
          }
        }
      });

      return popularCourses.map(course => ({
        courseId: course.id,
        score: 1.0, // 热门课程默认满分
        course: {
          title: course.title,
          description: course.description,
          coverImage: course.coverImage,
          instructor: { name: course.instructor.name }
        }
      }));
    } catch (error) {
      console.error("获取热门课程错误:", error);
      return []; // 返回空数组而非 null
    }
  }
}
