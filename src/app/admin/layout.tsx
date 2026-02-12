import "./../globals.css";
import SideBar from "@/components/sideBar";
import AuthGuard from "@/components/AuthGuard";
import { Suspense } from "react";
import { DashboardSkeleton, SidebarSkeleton } from "@/components/SkeletonLoader";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard redirectTo="/login">
      <div className="flex min-h-screen relative" style={{ background: 'linear-gradient(180deg, #030712 0%, #0a1628 40%, #0c2340 70%, #0f3460 100%)' }}>
        {/* Underwater light rays effect */}
        <div className="fixed top-0 left-1/4 w-[200px] h-[600px] bg-gradient-to-b from-cyan-400/10 via-cyan-400/5 to-transparent rotate-[15deg] blur-[40px] pointer-events-none" />
        <div className="fixed top-0 left-1/2 w-[150px] h-[500px] bg-gradient-to-b from-blue-400/10 via-blue-400/5 to-transparent rotate-[-10deg] blur-[30px] pointer-events-none" />
        <div className="fixed top-0 right-1/4 w-[180px] h-[550px] bg-gradient-to-b from-cyan-300/8 via-cyan-300/3 to-transparent rotate-[20deg] blur-[35px] pointer-events-none" />

        {/* Subtle wave overlay at bottom */}
        <div className="fixed bottom-0 left-0 right-0 h-[300px] pointer-events-none opacity-30">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '100%' }}>
            <path fill="rgba(6, 182, 212, 0.15)" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
            <path fill="rgba(59, 130, 246, 0.1)" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>

        {/* Deep water glow */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

        <Suspense fallback={<SidebarSkeleton />}>
          <SideBar />
        </Suspense>
        <main className="flex-1 p-6 md:ml-0 transition-all duration-300 relative z-10">
          <Suspense fallback={<DashboardSkeleton />}>
            {children}
          </Suspense>
        </main>
      </div>
    </AuthGuard>
  );
}
