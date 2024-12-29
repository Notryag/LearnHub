"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Recommendation {
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

export function CourseRecommendations() {
  const [recommendations, setRecommendations] = useState<{
    type: "personalized" | "popular";
    recommendations: Recommendation[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/recommendations?limit=6");
        const data = await response.json();
        setRecommendations(data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((_, index) => (
          <div key={index} className="bg-gray-200 rounded-lg h-64"></div>
        ))}
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  if (!recommendations.recommendations || recommendations.recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          {recommendations.type === "personalized" ? (
            <>
              <Sparkles className="w-6 h-6 mr-2 text-purple-500" />
              为你推荐
            </>
          ) : (
            <>
              <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
              热门课程
            </>
          )}
        </h2>
        <Badge variant={recommendations.type === "personalized" ? "default" : "secondary"}>
          {recommendations.type === "personalized" ? "个性化推荐" : "热门课程"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.recommendations.map((rec) => (
          <Card key={rec.courseId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg truncate">
                {rec.course.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full aspect-video mb-4">
                <Image
                  src={rec.course.coverImage || "/default-course-cover.png"}
                  alt={rec.course.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {rec.course.description}
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                讲师：{rec.course.instructor.name}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                推荐指数：{rec.score.toFixed(2)}
              </div>
              <Link href={`/courses/${rec.courseId}`}>
                <Button size="sm" variant="outline">
                  查看详情
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
