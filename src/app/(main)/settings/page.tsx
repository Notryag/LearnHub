import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Bell, 
  Lock, 
  Mail, 
  Languages, 
  CreditCard 
} from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      preferences: true,
      _count: {
        select: {
          enrollments: true,
          courses: true,
          assignments: true,
          ratings: true,
          comments: true
        }
      }
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* 个人信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              个人信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label>姓名</Label>
                <Input 
                  defaultValue={userProfile?.name || ""} 
                  name="name" 
                  placeholder="输入您的姓名" 
                />
              </div>
              <div className="space-y-2">
                <Label>邮箱</Label>
                <Input 
                  type="email"
                  defaultValue={userProfile?.email || ""} 
                  name="email" 
                  placeholder="输入您的邮箱" 
                  disabled={userProfile?.emailVerified}
                />
              </div>
              <Button type="submit">更新信息</Button>
            </form>
          </CardContent>
        </Card>

        {/* 账户设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              账户安全
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label>修改密码</Label>
                <Input 
                  type="password" 
                  name="currentPassword" 
                  placeholder="当前密码" 
                />
                <Input 
                  type="password" 
                  name="newPassword" 
                  placeholder="新密码" 
                  className="mt-2" 
                />
                <Input 
                  type="password" 
                  name="confirmPassword" 
                  placeholder="确认新密码" 
                  className="mt-2" 
                />
              </div>
              <Button type="submit" variant="destructive">
                更新密码
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              通知偏好
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>课程更新通知</Label>
                <Switch 
                  checked={userProfile?.preferences?.courseUpdateNotifications ?? true} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>新课程推荐</Label>
                <Switch 
                  checked={userProfile?.preferences?.courseRecommendationNotifications ?? true} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>系统公告</Label>
                <Switch 
                  checked={userProfile?.preferences?.systemNotifications ?? true} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 语言和区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Languages className="mr-2 h-5 w-5" />
              语言和区域
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>界面语言</Label>
                <select 
                  className="w-full p-2 border rounded"
                  defaultValue={userProfile?.preferences?.language ?? "zh-CN"}
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>时区</Label>
                <select 
                  className="w-full p-2 border rounded"
                  defaultValue={userProfile?.preferences?.timezone ?? "Asia/Shanghai"}
                >
                  <option value="Asia/Shanghai">中国标准时间 (UTC+8)</option>
                  <option value="America/New_York">美国东部时间 (UTC-5)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 订阅和计费 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              订阅和计费
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>当前角色：{userProfile?.role}</p>
              {userProfile?.role === "STUDENT" && (
                <Button variant="outline">
                  升级为讲师
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
