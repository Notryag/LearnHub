import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SectionForm } from "@/components/courses/section-form";
import { VideoUpload } from "@/components/courses/video-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  VideoIcon, 
  Settings 
} from "lucide-react";

export default async function CourseEditPage({ 
  params 
}: { 
  params: { courseId: string } 
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    redirect("/auth/login");
  }

  const course = await prisma.course.findUnique({
    where: { 
      id: params.courseId,
      instructorId: session.user.id 
    },
    include: {
      sections: {
        orderBy: { order: 'asc' }
      },
      _count: {
        select: { 
          sections: true,
          enrollments: true,
          comments: true,
          ratings: true
        }
      }
    }
  });

  if (!course) {
    redirect("/courses");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            基本信息
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            课程章节 ({course._count.sections})
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <VideoIcon className="w-4 h-4" />
            媒体资源
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>课程基本信息</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label>课程标题</Label>
                  <Input 
                    defaultValue={course.title} 
                    name="title" 
                    placeholder="输入课程标题" 
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>课程描述</Label>
                  <Textarea
                    defaultValue={course.description || ""}
                    name="description"
                    placeholder="详细介绍您的课程"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>课程价格</Label>
                  <Input 
                    type="number" 
                    defaultValue={course.price.toString()} 
                    name="price" 
                    placeholder="设置课程价格" 
                    min="0" 
                    step="0.01" 
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="published" 
                      defaultChecked={course.published} 
                      onCheckedChange={async (checked) => {
                        'use server'
                        await prisma.course.update({
                          where: { id: course.id },
                          data: { published: checked }
                        });
                      }}
                    />
                    <Label htmlFor="published">发布课程</Label>
                  </div>

                  <Button type="submit" variant="default">
                    保存更改
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle>课程章节管理</CardTitle>
            </CardHeader>
            <CardContent>
              <SectionForm courseId={course.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>课程封面和资源</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">课程封面</Label>
                <VideoUpload 
                  courseId={course.id} 
                  type="cover" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-destructive">危险区域</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-destructive">删除课程</h3>
              <p className="text-sm text-muted-foreground">
                删除课程将永久移除所有相关数据，此操作不可恢复
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={async () => {
                'use server'
                await prisma.course.delete({
                  where: { id: course.id }
                });
                redirect('/courses');
              }}
            >
              删除课程
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
