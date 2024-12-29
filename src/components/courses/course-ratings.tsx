"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, StarHalf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface Rating {
  id: string;
  contentRating: number;
  teacherRating: number;
  experienceRating: number;
  knowledgeRating: number;
  comment?: string | null;
  anonymous: boolean;
  user: User;
  createdAt: string;
}

interface RatingStats {
  averageRatings: {
    content: number;
    teacher: number;
    experience: number;
    knowledge: number;
  };
  totalRatings: number;
  totalPages: number;
  currentPage: number;
}

interface CourseRatingsProps {
  courseId: string;
  canRate: boolean;
}

export function CourseRatings({ courseId, canRate }: CourseRatingsProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [ratingData, setRatingData] = useState({
    contentRating: 0,
    teacherRating: 0,
    experienceRating: 0,
    knowledgeRating: 0,
    comment: "",
    anonymous: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchRatings = async (page = 1) => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/ratings?page=${page}`
      );
      const data = await response.json();
      
      if (page === 1) {
        setRatings(data.ratings);
      } else {
        setRatings((prev) => [...prev, ...data.ratings]);
      }
      
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [courseId]);

  const handleSubmitRating = async () => {
    // 验证评分
    const requiredRatings = [
      ratingData.contentRating,
      ratingData.teacherRating,
      ratingData.experienceRating,
      ratingData.knowledgeRating,
    ];

    if (requiredRatings.some(rating => rating === 0)) {
      alert("请完成所有评分维度");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/courses/${courseId}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ratingData),
      });

      if (response.ok) {
        const newRatingData = await response.json();
        
        // 更新评分列表和统计
        setRatings((prev) => [newRatingData, ...prev]);
        fetchRatings(1);  // 重新获取最新统计

        // 重置表单
        setRatingData({
          contentRating: 0,
          teacherRating: 0,
          experienceRating: 0,
          knowledgeRating: 0,
          comment: "",
          anonymous: false,
        });
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (stats) {
      fetchRatings(stats.currentPage + 1);
    }
  };

  const renderStars = (rating: number, size = 20, onChange?: (value: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange && onChange(star)}
            className={`${
              rating >= star
                ? "text-yellow-500"
                : "text-gray-300"
            }`}
          >
            <Star size={size} fill="currentColor" />
          </button>
        ))}
      </div>
    );
  };

  const renderRatingSection = (
    label: string, 
    value: number, 
    onChange: (value: number) => void
  ) => (
    <div className="flex items-center space-x-2">
      <span className="text-sm w-24">{label}：</span>
      {renderStars(value, 20, onChange)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">课程评价</h2>
        {stats && (
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <span>课程内容：</span>
              {renderStars(stats.averageRatings.content, 16)}
              <span className="text-xs text-muted-foreground">
                {stats.averageRatings.content.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span>讲师水平：</span>
              {renderStars(stats.averageRatings.teacher, 16)}
              <span className="text-xs text-muted-foreground">
                {stats.averageRatings.teacher.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span>学习体验：</span>
              {renderStars(stats.averageRatings.experience, 16)}
              <span className="text-xs text-muted-foreground">
                {stats.averageRatings.experience.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span>知识收获：</span>
              {renderStars(stats.averageRatings.knowledge, 16)}
              <span className="text-xs text-muted-foreground">
                {stats.averageRatings.knowledge.toFixed(1)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              总评价数：{stats.totalRatings}
            </div>
          </div>
        )}
      </div>

      {canRate && (
        <div className="space-y-4 mb-6 border rounded-lg p-4">
          <div className="space-y-2">
            {renderRatingSection(
              "课程内容", 
              ratingData.contentRating, 
              (value) => setRatingData(prev => ({ ...prev, contentRating: value }))
            )}
            {renderRatingSection(
              "讲师水平", 
              ratingData.teacherRating, 
              (value) => setRatingData(prev => ({ ...prev, teacherRating: value }))
            )}
            {renderRatingSection(
              "学习体验", 
              ratingData.experienceRating, 
              (value) => setRatingData(prev => ({ ...prev, experienceRating: value }))
            )}
            {renderRatingSection(
              "知识收获", 
              ratingData.knowledgeRating, 
              (value) => setRatingData(prev => ({ ...prev, knowledgeRating: value }))
            )}
          </div>

          <textarea
            value={ratingData.comment}
            onChange={(e) => setRatingData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="分享您对课程的详细评价（可选）"
            className="w-full rounded-md border p-2 min-h-[100px]"
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={ratingData.anonymous}
              onCheckedChange={(checked) => setRatingData(prev => ({ 
                ...prev, 
                anonymous: checked === true 
              }))}
            />
            <label
              htmlFor="anonymous"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              匿名评价
            </label>
          </div>

          <Button
            onClick={handleSubmitRating}
            disabled={isLoading}
          >
            提交评价
          </Button>
        </div>
      )}

      {ratings.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          还没有人评价这门课程
        </div>
      ) : (
        <div className="space-y-6">
          {ratings.map((rating) => (
            <div key={rating.id} className="border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                {!rating.anonymous ? (
                  <Image
                    src={rating.user.image || "/default-avatar.png"}
                    alt={rating.user.name || "用户"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <Image
                    src="/anonymous-avatar.png"
                    alt="匿名用户"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium text-sm">
                        {rating.anonymous ? "匿名用户" : rating.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(rating.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground w-20">课程内容：</span>
                      {renderStars(rating.contentRating, 16)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground w-20">讲师水平：</span>
                      {renderStars(rating.teacherRating, 16)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground w-20">学习体验：</span>
                      {renderStars(rating.experienceRating, 16)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground w-20">知识收获：</span>
                      {renderStars(rating.knowledgeRating, 16)}
                    </div>
                  </div>

                  {rating.comment && (
                    <p className="text-sm mt-2">{rating.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {stats && stats.currentPage < stats.totalPages && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                加载更多
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
