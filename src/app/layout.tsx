import { GeistSans } from "geist/font/sans"
import { getServerSession } from "next-auth";
import { SessionProvider } from "@/components/providers/session-provider";
import { authOptions } from "./api/auth/[...nextauth]/route";
import "./globals.css";
import { MainNav } from "@/components/layout/main-nav";
import { Toaster } from "@/components/ui/toaster";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
// });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="zh">
      <body className={`${GeistSans.variable} font-sans p-4 md:p-8`}>
        <SessionProvider session={session}>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow pb-16 md:pb-0 md:pt-16">
              {children}
            </main>
            <MainNav />
          </div>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
