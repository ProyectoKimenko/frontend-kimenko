import "./globals.css";
import SideBar from "@/components/sideBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          <SideBar />
          <main className="flex-1 p-6 md:ml-20">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
