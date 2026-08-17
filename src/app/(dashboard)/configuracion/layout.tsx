import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.rol !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
