import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Providers } from "@/components/Providers";
import { PrismaClient } from "@prisma/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Update last login date when accessing the dashboard
  const prisma = new PrismaClient();
  try {
    await prisma.usuario.update({
      where: { id: (session.user as any).id },
      data: { lastLogin: new Date() }
    });
  } catch (error) {
    console.error("Failed to update last login:", error);
  } finally {
    await prisma.$disconnect();
  }

  return (
    <div className="dashboard-container">
      <Sidebar 
        userName={((session.user as any)?.nombre || session.user?.name || "").split(" ")[0]} 
        userRole={(session.user as any)?.rol}
      />
      
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
