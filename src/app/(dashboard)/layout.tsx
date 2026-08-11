import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Providers } from "@/components/Providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="dashboard-container">
      <Sidebar userName={((session.user as any)?.nombre || session.user?.name || "").split(" ")[0]} />
      
      <main className="main-content">
        <header className="main-header glass-panel animate-fade-in desktop-only-header">
          <h3>Bienvenido, {((session.user as any)?.nombre || session.user?.name || "").split(" ")[0]}</h3>
        </header>
        <div className="content-area animate-fade-in">
          <Providers>
            {children}
          </Providers>
        </div>
      </main>
    </div>
  );
}
