import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CreateCoursePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "INSTRUCTOR") {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>创建新课程</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/courses/create" method="POST" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">课程标题</Label>
              <Input 
                type="text" 
                id="title" 
                name="title" 
                placeholder="输入课程标题" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">课程描述</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="简要介绍您的课程"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">课程价格</Label>
              <Input 
                type="number" 
                id="price" 
                name="price" 
                placeholder="设置课程价格" 
                min="0" 
                step="0.01" 
                required 
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="w-full">
                创建课程
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
