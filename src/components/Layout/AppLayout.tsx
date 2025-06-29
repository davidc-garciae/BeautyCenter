import { ReactNode, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { AppHeader } from "@/components/organisms/AppHeader";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AppLayout({ children, breadcrumbs }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (!isMounted || status === "loading") {
    return <LoadingSpinner />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar user={session?.user} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <AppHeader breadcrumbs={breadcrumbs} />
          <div className="flex-1 overflow-auto p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
