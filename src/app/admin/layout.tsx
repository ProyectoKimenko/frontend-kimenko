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
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Suspense fallback={<SidebarSkeleton />}>
          <SideBar />
        </Suspense>
        <main className="flex-1 p-6 md:ml-0 transition-all duration-300">
          <Suspense fallback={<DashboardSkeleton />}>
            {children}
          </Suspense>
        </main>
      </div>
    </AuthGuard>
  );
}
